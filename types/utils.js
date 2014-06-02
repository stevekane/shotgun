var mustProvide = function (hash, keys) {
  keys.forEach(function (key) {
    if (!hash[key]) {
      throw new Error("Must provide " + key + " in your constructor hash");
    }
  });
};

module.exports.mustProvide = mustProvide;
