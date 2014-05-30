var requestt = require("request");

module.exports = function (options) {

  var getServerIp = function (cb) {
    request("https://api.page-vault.com/utils/myip", function (err, res, body) {
      cb(err, body); 
    });
  };

  return {
    getServerIp: getServerIp
  };
};
