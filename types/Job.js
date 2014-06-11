var mustProvide = require("./utils").mustProvide;
var _ = require("lodash");
var extend = _.extend;
var cloneDeep = _.cloneDeep;

module.exports = function (hash) {
  var job = {};

  mustProvide(hash, ["urls", "folderId", "token"]);

  extend(job, {
    urls: cloneDeep(hash.urls),
    folderId: hash.folderId,
    token: hash.token
  });

  return job;
};
