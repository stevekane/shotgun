var express = require("express");
var ecstatic = require("ecstatic");
var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("index");
});

app.listen(8081, function () {
  console.log("server listening on 8081");
});
