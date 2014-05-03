var webpage = require('webpage')
  , system = require("system");

var urls;

var addDateTime = function (url) {
  return url + ".png";
};

var captureMultiple = function (urls, eachCb, finalCb) {
  var index = 0;

  var capture = function () {
    if (index >= urls.length) {
      return finalCb(null, "done"); 
    } else {
      eachCb(null, urls[index]);
      index = index + 1;
      setTimeout(capture, 1000);
    }
  };

  setTimeout(capture, 1000);
};

var sendFinal = function (err, message) {
  system.stdout.write(message);
};

var sendStatus = function (err, message) {
  system.stdout.write(message);  
};

if (system.args.length > 1) {
  urls = JSON.parse(Array.prototype.slice.call(system.args, 1));
  captureMultiple(urls, sendStatus, sendFinal);
};

//console.log(system.stdin.readLine());
