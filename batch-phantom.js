var phantom = require("phantom")
  , restify = require("restify")
  , async = require("async")
  , nodemailer = require("nodemailer")
  , _ = require("lodash")
  , partial = _.partial;

/*
 * Here we recieve a request and check that it has an email and urls.
 * We place this request into a queue which can run PHANTOM_COUNT 
 * concurrent tasks.
 *
 * When a task is processed it is passed to a function which spins up
 * a phantom and then creates a queue of urls to be processed.  When the
 * queue is emptied, a drain function is called which emails the 
 * results of the job to the provided email
 * 
 *
* */

var options = {
  "TAB_COUNT": 20,
  "PHANTOM_COUNT": 4,
  "RENDER_DELAY": 200,
  "DEBUG": false,
  "MAIL_CONFIG": {
    service: "Gmail",
    auth: {
      user: "testmailpv83@gmail.com",
      pass: "pagevault"
    }
  }
};

//mutative..  required by phantom api
var configurePage = function (page) {
  page.set("onError", function (msg, trace) {
    console.error(url + " reported: " + msg); 
  });
  page.set("viewportSize", {
    width: 1200,
    height: 800 
  });
};

//given an instance of phantom, process url and cb with image string
var captureBase64 = function (phantom, options, url, cb) {
  phantom.createPage(function (page) {
    configurePage(page);
    page.open(url, function () {
      setTimeout(function () {
        page.renderBase64("png", function (image) {
          var payload = {
            image: image,
            url: url 
          };
          cb(null, payload); 
          page.close();
        }); 
      }, options.RENDER_DELAY); 
    });
  }); 
};

/*
 * given a set of urls, spawn a phantom, create a queue, and push
 * the urls onto that queue for processing.
 *
 * As each processing job completes, add that result to the results
 * array.  When the queue is drained then return the results to
 * the provided callback.
*/
var processUrls = function (options, job, cb) {
  phantom.create(function (ph) {
    var captureFn = partial(captureBase64, ph, options);
    var queue = async.queue(captureFn, options.TAB_COUNT);
    var results = [];
    var trackResult = function (err, result) {
      console.log(result.url + " completed");
      results.push({
        url: result.url,
        status: err ? "failed" : "succeeded"
      }); 
    };

    queue.push(job.urls, trackResult);
    queue.drain = function () {
      console.log("drain called");
      cb(null, results);
      phantom.exit();  
    }; 
  });
};

//configure routes w/ instance of queue and server
var setupRoutes = function (queue, mailer, server) {
  server.post("/process", function (req, res, next) {
    var urls = req.body.urls;
    var email = req.body.email;
    var validReq = urls && email;
    var goodReqText = "Your job is processing.  Results will be sent to " + email;
    var badReqText = "Please supply both an email and list of urls for processing.";
    var job = {
      email: email,
      urls: urls 
    };

    var sendEmail = function (err, results) {
      var mailOptions = {
        from: "testmailpv83@gmail.com",
        to: "kanesteven@gmail.com",
        subject: "Results of your batch processing request",
        text: JSON.stringify(results, null, 4)
      };
      mailer.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.error("EMAIL ERROR"); 
          console.error(err.message); 
          console.error(err.stack); 
        }
      });
    };

    if (!validReq) {
      return res.send(400, badReqText);
    } else {
      queue.push(job, sendEmail);
      return res.send(200, goodReqText);
    }
  });
};

//helper to read status of queue
var reportQueueStatus = function (queue) {
  console.log(queue.length() + " waiting");
  console.log(queue.running() + " processing");
};

//called to create phantom instance, queue, and webserver
var boot = function (options) {
  var server = restify.createServer();
  var mailer = nodemailer.createTransport("SMTP", options.MAIL_CONFIG);
  var processFn = partial(processUrls, options);
  var queue = async.queue(processFn, options.PHANTOM_COUNT);

  server.use(restify.CORS());
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.authorizationParser());
  server.use(restify.dateParser());
  server.use(restify.queryParser());
  server.use(restify.jsonp());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());

  setupRoutes(queue, mailer, server);
  server.listen(8080, console.log.bind(console, "Listening on 8080"));
};

boot(options);
