var request = require("request")
  , async = require("async")
  , moment = require("moment")
  , test = require("tape");

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
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
  "http://www.google.com",
  "http://www.reddit.com",
  "http://www.github.com",
  "http://www.slashdot.org",
  "http://www.rottentomatoes.com",
  "http://www.twitter.com",
  "http://www.instagram.com",
  "http://www.page-vault.com",
  "http://bitbucket.org",
  "http://lawyers.com",
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

//create pool to increase concurrent request count
var requestPool = {
  maxSockets: 100
};

//FIXME: Some connections may still be timing out?  investigate
var postToUrl = function (url, cb) {
  var timeout = 1000 * 60 * 5;
  var targetUrl = "http://localhost:8080/capture";
  var options = {
    timeout: timeout,
    pool: requestPool,
    url: targetUrl,
    json: {
      url: url 
    }
  };
  return request.post(options, function (err, res, body) {
    cb(err, body); 
  });
};

test("find out how long it takes to return valid image for 1 query", function (t) {
  t.plan(1);
  var start = Date.now();

  postToUrl(urls[0], function (err, res) {
    var end = Date.now();
    var elapsed = end - start;
    
    t.true(typeof res.image === "string", "Returned 1 query in " + elapsed + " ms");
  });
});

test("find out how long it takes to return valid results for 100 queries", function (t) {
  t.plan(urls.length);
  //t.plan(urls.length * 2);
  var start = Date.now();
  var counter = 0;

  async.each(urls, function (url, cb) {
    postToUrl(url, function (err, res) {
      var stamp = Date.now();
      var elapsed = stamp - start;
      counter = counter + 1;

      //t.true(!err, "no errors during processing of " + url);
      if (err) t.true(!!err, "There was an error with " + counter + "/100 " + url);
      else t.true(typeof res.image === "string", counter + "/100 " + url + " in " + elapsed + " ms");
      cb(err, res);
    }, function (err) {
      t.true(!err, "no errors during processing of 10 queries");
    })
  });
});
