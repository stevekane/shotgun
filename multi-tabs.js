var phantom = require("phantom")
  , restify = require("restify")
  , _ = require("lodash")
  , map = _.map
  , pluck = _.pluck
  , partial = _.partial
  , async = require("async")
  , uuid = require("node-uuid");

//maximum concurrent tabs allowed open in phantom process
var TAB_COUNT = 2;
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

//given an instance of phantom, process a url and fire cb
var capturePage = function (phantom, url, cb) {
  phantom.createPage(function (page) {
    page.open(url, function () {
      setTimout(function () {
        page.renderBase64("png", function (image) {
          cb(null, image); 
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
 */
phantom.create(function (ph) {
  //var queue = async.queue(partial(capturePage, ph), TAB_COUNT);
  var queue = async.queue(partial(testCapture, ph), TAB_COUNT);

  urls.forEach(function (url) {
    queue.push(url, logResult);
  });
});
