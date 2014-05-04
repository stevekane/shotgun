var phantom = require("phantom")
  , restify = require("restify")
  , uuid = require("node-uuid");

var queue = [];
var server = restify.createServer();

var addToQueue = function (url, cb) {
  var id = uuid.v4()
    , fileName = id + ".png";

  queue.push({
    cb: cb,
    url: url,
    id: id,
    fileName: fileName,
    inProgress: false 
  });
};

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post("/capture", function (req, res, next) {
  var url = req.body.url;

  if (!url) {
    return res.send(400, {err: "No url provided"});
  } else {
    addToQueue(url, function (err, image) {
      if (err) {
        return res.send(400, {err: err.message || err});
      } else {
        return res.send(200, image + " has been created"); 
      }
    }); 
  }
});

server.listen(8080, function () {
  console.log("listening on port 8080");
});

phantom.create(function (ph) {
  ph.createPage(function (page) {

    console.log("Phantom started");
    console.log("page started");

    var capturePage = function (item) {
      item.inProgress = true;

      page.open(item.url, function () {
        //we wait 4seconds to allow assets to load
        setTimeout(function () {
          page.render(item.fileName); 
          item.cb(null, item.fileName);
          queue.shift();
        }, 200); 
      });
    };

    var checkQueue = function () {
      if (queue.length && !queue[0].inProgress) {
        capturePage(queue[0]);
        console.log("Queue size: " + queue.length);
      }
    };

    setInterval(checkQueue, 100);

    page.set("onError", function (msg, trace) {
      console.log("some error occured"); 
    });
    page.set("viewportSize", {
      width: 1200,
      height: 800 
    });
  });
});
