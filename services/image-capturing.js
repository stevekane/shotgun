var parseUrl = require("url").parse
  , phantom = require("phantom")
  , moment = require("moment")
  , _ = require("lodash")
  , partial = _.partial;

module.exports = function (options) {
  
  //script run inside the javascript context of the page
  var scrapeDom = function () {
    return document.getElementsByTagName("html")[0].innerHTML;
  };

  //create fileName from url and timestamp
  var buildName = function (url, utcMoment) {
    return parseUrl(url).host 
    + "_" + utcMoment.format("YYYY-MM-DD-hh-mm-ss") 
    + ".png";
  };

  //given an instance of phantom, process url and cb with image string
  var capturePage = function (phantom, url, cb) {
    phantom.createPage(function (page) {
      console.log("page created");
      var pageErrors = [];

      page.set("viewportSize", options.viewportSize)

      page.set("onError", function (msg, trace) {
        pageErrors.push(msg);
      });

      page.open(url, function () {
        console.log(url, "page opened");
        setTimeout(function () {

          page.evaluate(scrapeDom, function (dom) {
            console.log(url, "page scraped")
          
            page.renderBase64("png", function (image) {
              console.log(url, "page rendered");
              var timestamp = moment.utc();

              var payload = {
                ImageBase64: image,
                Dom: dom,
                Html: dom,
                SnapshotName: buildName(url, timestamp),
                InitialLoadTimeUTC: timestamp.format(),
                Width: options.viewportSize.width,
                Height: options.viewportSize.height,
                ServerUrl: url,
                HeaderOverlapPixels: options.HEADER_OVERLAP_PIXELS || 125,
                ExtendedProperties: [{
                  pageErrors: pageErrors 
                }]
              };
              cb(null, payload); 
              page.close();
            }); 

          });

        }, options.RENDER_DELAY || 2000); 

      });
    }, {
      dnodeOpts: {
        weak: false
      }  
    }); 
  };

  return {
    capturePage: capturePage
  };
};
