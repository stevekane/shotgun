var dns = require("dns")
  , phantom = require("phantom")
  , restify = require("restify")
  , async = require("async")
  , nodemailer = require("nodemailer")
  , _ = require("lodash")
  , partial = _.partial
  , extend = _.extend
  , Job = require("./types/Job")
  , Snapshot = require("./types/Snapshot")
  , PageResult = require("./types/PageResult")
  , options = require("./config.json");

var cap = require("./services/image-capturing")(options.phantom);
var proc = require("./services/image-processing")(options.processor);
var pvApi = require("./services/pv-api")(options.api);
var capturePage = cap.capturePage;
var processSnapshot = proc.processSnapshot;
var getServerIp = pvApi.getServerIp;

//TESTS
proc.verify(function (err, res, body) {
  console.log(err);
  console.log(body);
});
//END TESTS

//configure routes w/ instance of queue and server
var setupRoutes = function (queue, mailer, server) {
  server.post("/capture", function (req, res, next) {
    console.log("body recieved");
    var validReq = 
      req.body.urls && 
      req.body.folderId && 
      req.body.token;
    var status = validReq ? 200 : 400;
    var message = validReq 
      ? "Your job is processing" 
      : "Please supply urls, folderId, token";
    var onJobComplete = function (err, results) {
      console.log("Imagine this was emailed to you");
      console.log(results);   
    };

    if (validReq) queue.push(Job(req.body), onJobComplete);
    
    res.send(status, message);
  });
};

//try to fetch IP for website
var fetchIpForUrl = function (url, cb) {
  dns.resolve4(url, function (err, ips) {
    var ip = ips ? ips[0] : "";

    cb(null, ip);
  });
};

//TODO: needs to take snapshot and send to image processor
var processUrl = function (phantom, job, url, cb) {
  async.auto({
    page: partial(capturePage, phantom, url),
    serverIp: getServerIp,
    siteIp: partial(fetchIpForUrl, url),
    processor: ["page", "serverIp", "siteIp", function (cb, results) {
      var snapshot = Snapshot(job, results.serverIp, results.siteIp, results.page);
        
      processSnapshot(snapshot, function (err, res, feedback) {
        cb(err, feedback);
      });
    }]
  }, function (err, results) {
    //console.log(err);
    console.log(results.processor);
    cb(null, PageResult(url, !err));
  });
};

var processUrls = function (options, job, cb) {
  phantom.create(function (ph) {
    console.log("phantom created");
    var processFn = partial(processUrl, ph, job);
    var queue = async.queue(processFn, options.TAB_COUNT);
    var results = [];
    var trackResult = function (err, pageResult) {
      results.push(pageResult);
    };
    queue.drain = function () {
      console.log("drain called");
      cb(null, results);
      ph.exit();  
    }; 

    queue.push(job.urls, trackResult);
  });
};

var server = restify.createServer();
var mailer = nodemailer.createTransport("SMTP", options.email);
var processFn = partial(processUrls, options.phantom);
var queue = async.queue(processFn, options.phantom.PHANTOM_COUNT);

server.use(restify.CORS());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

setupRoutes(queue, mailer, server);
server.listen(8080, console.log.bind(console, "Listening on 8080"));
