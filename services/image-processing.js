var request = require("request")
  , uuid = require("node-uuid")
  , _ = require("lodash")
  , extend = _.extend
  , pick = _.pick

var throwIfNotFound = function (obj, propNames) {
  forEach(propNames, function (name) {
    if (obj[name] === undefined || obj[name] === null) {
      throw new Error("No property " + name + " found"); 
    } 
  }); 
};

//STRUCT DEF FOR SNAPSHOT OBJECT
var Snapshot = function (params) {
  var obj = {};

  throwIfNotFound(params, [
    "AccountUser",
    "FolderId",
    "ServerUrl",

    "PageVaultServerIp", 
    "CaptureWebsiteIp",

    "Snapshot",
    "SnapshotName",
    "InitialLoadTimeUTC",
    "HeaderOverlapPixels",
    "ViewportSize",
    "Dom",
    "Html"
  ]);

  extend(obj, {
    AccountUser: params.AccountUser,
    SnapshotGuid: uuid.v4(),
    SnapshotName: params.SnapshotName,
    Snapshot: params.Snapshot,
    ServerUrl: params.ServerUrl,
    InitialLoadTimeUTC: params.InitialLoadTimeUTC,
    PageVaultServerIp: params.PageVaultServerIp,
    CaptureWebsiteIp: params.CaptureWebsiteIp,
    FolderId: params.FolderId,
    HeaderOverlapPixels: params.HeaderOverlapPixels || 125,
    ViewportSize: params.ViewportSize,
    Dom: params.Dom,
    Html: params.Html
  }); 

  return obj;
};

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
