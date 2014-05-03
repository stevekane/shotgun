var page = require('webpage').create()
  , system = require("system");

var urls;
var queue = [];

var addToQueue = function (queue, urls) {
  urls.forEach(function (url) {
    queue.push({
      url: url,
      inProgress: false 
    });
  });
};

var addDateTime = function (url) {
  return url + ".png";
};

var capturePage = function (item) {
  item.inProgress = true;
  console.log(item.url + " in progress...");
  setTimeout(function () {
    queue.shift();
  }, 2000);

  //page.open(url, function () {
  //  setTimeout(function () {
  //    page.render(); 
  //    cb(null, url);
  //  }, 4000); 
  //});
};

var captureNext = function () {
  if (queue.length && !queue[0].inProgress) {
    capturePage(queue[0]);
  }
};

var sendFinal = function (err, message) {
  system.stdout.write(message);
};

var sendStatus = function (err, message) {
  system.stdout.write(message);  
};

if (system.args.length > 1) {
  urls = JSON.parse(Array.prototype.slice.call(system.args, 1));
  addToQueue(queue, urls);
};

setInterval(captureNext, 200);
