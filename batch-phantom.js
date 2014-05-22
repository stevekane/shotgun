var dns = require("dns")
  , phantom = require("phantom")
  , restify = require("restify")
  , async = require("async")
  , nodemailer = require("nodemailer")
  , _ = require("lodash")
  , partial = _.partial
  , extend = _.extend

var options = {
  "TAB_COUNT": 20,
  "PHANTOM_COUNT": 4,
  "RENDER_DELAY": 200,
  "DEBUG": false,
  "viewportSize": {
    width: 1200,
    height: 800 
  },
  "MAIL_CONFIG": {
    service: "Gmail",
    auth: {
      user: "testmailpv83@gmail.com",
      pass: "pagevault"
    }
  }
};

var capture = require("./services/image-capturing")(options);
var process = require("./services/image-processing")(options);
var pvApi = require("./services/pv-api")(options);
var capturePage = capture.capturePage;
var processSnapshot = process.processSnapshot;
var getServerIp = pvApi.getServerIp;

//configure routes w/ instance of queue and server
var setupRoutes = function (queue, mailer, server) {
  server.post("/capture", function (req, res, next) {
    var urls = req.body.urls;
    var folderId = req.body.folderId;
    var user = req.body.user;
    var validReq = urls && folderId && user;
    var goodReqText = "Your job is processing.";
    var badReqText = "Please supply urls, folderId, and user.";
    var job = {
      folderId: folderId,
      user: user,
      urls: urls
    };

    if (!validReq) {
      return res.send(400, badReqText);
    } else {
      queue.push(job, function () {
        console.log("job completed"); 
      });
      return res.send(200, goodReqText);
    }
  });
};

//try to fetch IP for website
var fetchIpForUrl = function (url, cb) {
  dns.resolve4(url, function (err, ips) {
    var ip = ips ? ips[0] : "";

    cb(null, ip);
  });
};

//fetch IP for PageVault Server and IP for url
var addIps = function (payload, cb) {
  async.parallel({
    PageVaultServerIp: getServerIp,
    CaptureWebsiteIp: partial(fetchIpForUrl, payload.ServerUrl)
  }, function (err, results) {
    if (err) return cb(err);

    extend(payload, results);
    cb(null, payload);
  });
};

var processUrl = function (phantom, job, url, cb) {
  capturePage(phantom, url, function (err, payload) {
    if (err) return cb(err); 
    addIps(payload, function (err, newPayload) {
      if (err) return cb(err); 

      extend(newPayload, {
        AccountUser: job.user,
        FolderId: job.folderId 
      });

      processSnapshot(newPayload, function (err, res) {
        console.log(newPayload);
        cb(null, {
          url: url,
          status: err ? "failed" : "succeeded"
        }); 
      });
    });
  });
};

var processUrls = function (options, job, cb) {
  phantom.create(function (ph) {
    var processFn = partial(processUrl, ph, job);
    var queue = async.queue(processFn, options.TAB_COUNT);
    var results = [];
    var trackResult = function (err, result) {
      if (err) console.log(err.stack);
      else {
        console.log(result.ServerUrl + " completed");
        results.push(result);
      }
    };

    queue.push(job.urls, trackResult);
    queue.drain = function () {
      console.log("drain called");
      cb(null, results);
      ph.exit();  
    }; 
  });
};

var server = restify.createServer();
var mailer = nodemailer.createTransport("SMTP", options.MAIL_CONFIG);
var processFn = partial(processUrls, options);
var queue = async.queue(processFn, options.PHANTOM_COUNT);

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
