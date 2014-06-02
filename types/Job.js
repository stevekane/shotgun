var mustProvide = require("./utils").mustProvide;
var _ = require("lodash");
var extend = _.extend;
var cloneDeep = _.cloneDeep;

module.exports = function (hash) {
  var job = {};

  mustProvide(hash, ["urls", "folderId", "userId"]);

  extend(job, {
    urls: cloneDeep(hash.urls),
    folderId: hash.folderId,
    userId: hash.userId
  });

  return job;
};
