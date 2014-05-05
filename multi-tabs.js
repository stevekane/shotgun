var phantom = require("phantom")
  , restify = require("restify")
  , _ = require("lodash")
  , map = _.map
  , pluck = _.pluck
  , partial = _.partial
  , uuid = require('node-uuid')
  , parseUrl = require('url').parse
  , async = require("async");

//maximum concurrent tabs allowed open in phantom process
var TAB_COUNT = 20;
//time a tab waits before capturing page to allow js to run
var RENDER_DELAY = 200;

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

var urls = [
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com"
];

//given an instance of phantom, process url and cb with image string
var captureBase64 = function (phantom, url, cb) {
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
      }, RENDER_DELAY); 
    });
  }); 
};

//given instance of phantom, process url and save image to disk
var captureToDisk = function (phantom, url, cb) {
  phantom.createPage(function (page) {
    page.set("onError", function (msg, trace) {
      console.log(url + " reported: " + msg); 
    });
    page.set("viewportSize", {
      width: 1200,
      height: 800 
    });
    page.open(url, function () {
      var fileName = parseUrl(url).host + uuid.v4() + ".png";

      setTimeout(function () {
        page.render(fileName, function (err) {
          cb(null, fileName); 
          page.close();
        }); 
      }, RENDER_DELAY); 
    });
  }); 
};

//for testing
var testCapture = function (phantom, url, cb) {
  setTimeout(function () {
    cb(null, url + " was captured."); 
  }, 1000);
};

//for testing
var logResult = function (err, res) {
  if (err) console.log(err); 
  console.log(res); 
};


/*
 * create an instance of phantom.  create a queue with a callback
 * that has a reference to our phantom instance.
 * TODO: Queue probably needs to have ability to transfar to new
 * phantom instance if this one dies....
 */
phantom.create(function (ph) {
  //var queue = async.queue(partial(captureBase64, ph), TAB_COUNT);
  //var queue = async.queue(partial(testCapture, ph), TAB_COUNT);
  var processUrl = partial(captureToDisk, ph);
  var queue = async.queue(processUrl, TAB_COUNT);

  urls.forEach(function (url) {
    queue.push(url, logResult);
  });
  urls.forEach(function (url) {
    queue.push(url, logResult);
  });
  urls.forEach(function (url) {
    queue.push(url, logResult);
  });

  queue.drain = function () {
    console.log("queue empty!!!!!!!!!!!!!!!!"); 
  };
});
