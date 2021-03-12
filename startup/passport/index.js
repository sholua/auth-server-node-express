const passport = require("passport");

require("./jwt");

module.exports = function (app) {
  app.use(passport.initialize());
};
