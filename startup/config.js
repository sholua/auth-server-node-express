const config = require("config");

module.exports = function () {
  if (!config.get("accessTokenSecret") && !config.get("refreshTokenSecret")) {
    throw new Error(
      "FATAL ERROR: accessTokenSecret or refreshTokenSecret is not defined."
    );
  }
};
