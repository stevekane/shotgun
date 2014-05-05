var phantom = require("phantom")
  , restify = require("restify")
  , async = require("async")
  , _ = require("lodash")
  , partial = _.partial;

/*
 * Our queue object manages the maximum number of items that
 * can be concurrently processed (TAB_COUNT).  We add CaptureRequest
 * objects to the queue which contain a callback that should
 * be called when the CR is done being captured.  
 *
 * Pages or "tabs"
 * in phantom are closed upon completion of a single capture job.
 * This reduces the bookkeeping complexity of tracking which tabs
 * are available or not.
 *
 * HTTP REQ w/ URL -> 
 *  CaptureRequest -> 
 *   push onto queue -> 
 *    callback when captured w/ image string ->
 *      HTTP RES w/ json containing image string
*/

var options = {
  "TAB_COUNT": 20,
  "RENDER_DELAY": 200,
  "DEBUG": false
};

//given an instance of phantom, process url and cb with image string
var captureBase64 = function (phantom, options, url, cb) {
  phantom.createPage(function (page) {
    page.set("onError", function (msg, trace) {
      console.log(url + " reported: " + msg); 
    });
    page.set("viewportSize", {
      width: 1200,
      height: 800 
    });
    page.open(url, function () {
      setTimeout(function () {
        page.renderBase64("png", function (image) {
          cb(null, image); 
          page.close();
        }); 
      }, options.RENDER_DELAY); 
    });
  }); 
};

//configure routes w/ instance of queue and server
var setupRoutes = function (queue, server) {
  server.post("/capture", function (req, res, next) {
    var url = req.body.url;
    var respond = function (err, image) {
      if (err) return res.send(400, {err: err.message || err});
      else return res.send(200, {image: image}); 
    };

    if (!url) return res.send(400, {err: "No url provided"});
    else queue.push(url, respond);
  });
};

//helper to read status of queue
var reportQueueStatus = function (queue) {
  console.log(queue.length() + " waiting");
  console.log(queue.running() + " processing");
};

//called to create phantom instance, queue, and webserver
var boot = function (options) {
  phantom.create(function (ph) {
    var captureFn = partial(captureBase64, ph, options);
    var queue = async.queue(captureFn, options.TAB_COUNT);
    var server = restify.createServer();

    server.use(restify.CORS());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.authorizationParser());
    server.use(restify.dateParser());
    server.use(restify.queryParser());
    server.use(restify.jsonp());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser());

    setupRoutes(queue, server);
    if (options.DEBUG) setInterval(partial(reportQueueStatus, queue), 2000);
    server.listen(8080, console.log.bind(console, "Listening on 8080"));
  });
};

boot(options);
