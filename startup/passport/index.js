const passport = require("passport");
const mustacheExpress = require("mustache-express");

require("./local");
require("./jwt");
require("./google");
require("./facebook");

// TODO: make config for mustache in separate startup file
module.exports = function (app) {
  app.engine("html", mustacheExpress());
  app.set("view engine", "mustache");
  app.set("views", __dirname + "/public");
  app.use(passport.initialize());
};
