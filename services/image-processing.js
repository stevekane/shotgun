var request = require("request");
var _ = require("lodash");
var p = _.partial;

module.exports = function (options) {
  var processor = request.defaults({
    "headers": {
      "Authorization": options.auth,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "url": options.url
  });

  var verify = p(processor.get, {});

  var processSnapshot = function (snapshot, cb) {
    processor.post({json: snapshot}, cb);
  };

  return {
    verify: verify,
    processSnapshot: processSnapshot
  };
};
