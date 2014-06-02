var mustProvide = require("./utils").mustProvide;
var _ = require("lodash");
var extend = _.extend;
var cloneDeep = _.cloneDeep;

module.exports = function (job, serverIp, siteIp, page) {
  var snapshot = cloneDeep(page);

  //TODO: implement requirements checking for constructor

  extend(snapshot, {
    AccountUser: job.userId,
    FolderId: job.folderId,
    PageVaultServerIp: serverIp,
    CaptureWebsiteIp: siteIp,
  });

  return snapshot;
};
