var fs = require('fs')
  , path = require("path")
  , cp = require("child_process")
  , stream = require("stream")
  , parseUrl = require("url").parse
  , moment = require('moment')
  , _ = require("lodash")
  , compose = _.compose
  , restify = require("restify")
  , async = require("async")
  , webshot = require("webshot");

var urls = [
  "http://google.com",
  "http://github.com",
  "http://facebook.com",
  "http://reddit.com",
  "http://instagram.com",
  "http://digg.com"
];

var phantomArgs = [
  "phantom.captureMultiple.js",
  JSON.stringify(urls)
];

var phantomProc = cp.spawn("phantomjs", phantomArgs);
phantomProc.stdout.on("data", function (data) {
  console.log("Data: " + data);
});
phantomProc.on("exit", function () {
  console.log("exit");
});


//FIXME: should probably include the path as well
//atm returning urls in a filename isn't working
//parsedUrl.host + parsedUrl.path;
var stripProtocol = function (url) {
  var parsedUrl = parseUrl(url);
  
  return parsedUrl.host;
};

var addDateTime = function (url) {
  return moment().format("MM-DD-YYYY-") + url + ".png";
};

var generateFileName = compose(addDateTime, stripProtocol);

var captureUrl = function (url, cb) {
  var fileName = generateFileName(url);
  var wsOptions = {
    windowSize: {
      height: 1200,
      width: 1920 
    }, 
    shotSize: {
      height: "all",
      width: "all" 
    },
    siteType: "url",
    renderDelay: 5000
  };

  webshot(url, fileName, wsOptions, function(err, renderStream) {
    return cb(err, fileName);
  });
};

//async.map(urls, captureUrl, function (err, res) {
//  if (err) console.log(err.trace);
//  console.log(res);
//});
