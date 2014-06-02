var request = require("request");

module.exports = function (options) {

  var processSnapshot = function (snapshot, cb) {
    setTimeout(function () {
      cb(null, "Processing successful"); 
    }, 1000);
  };

  return {
    processSnapshot: processSnapshot 
  };
};
