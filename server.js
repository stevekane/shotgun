var cp = require("child_process")
  , stream = require("stream")
  , restify = require("restify");

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
  //probably want to reboot the process if this happens
});
