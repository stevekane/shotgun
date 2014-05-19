var express = require("express");
var ecstatic = require("ecstatic");
var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("index");
});

//app.post("/process", function (req, res) {
//  var duration = Math.floor(Math.random() * 20000);
//  var shouldFail = Math.random() >= .9 ? false : true;
//
//  setTimeout(function () {
//    if (shouldFail) {
//      res.send(400, {err: new Error("Processing failed") });
//    }  else {
//      res.send(200, {message: "Processing completed"});
//    }
//  }, duration);
//});

app.listen(8081, function () {
  console.log("server listening on 8081");
});
