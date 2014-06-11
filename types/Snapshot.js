var mustProvide = require("./utils").mustProvide;
var _ = require("lodash");
var extend = _.extend;
var cloneDeep = _.cloneDeep;

module.exports = function (job, serverIp, siteIp, page) {
  var snapshot = cloneDeep(page);

  //TODO: implement requirements checking for constructor

  extend(snapshot, {
    FolderId: job.folderId,
    UserToken: job.token,
    PageVaultServerIp: serverIp,
    CapturedWebsiteIp: siteIp,
  });

  return snapshot;
};
