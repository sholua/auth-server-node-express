const winston = require("winston");
const express = require("express");
const app = express();

global.__basedir = __dirname;

require("./startup/config")();
require("./startup/db")();
require("./startup/logging")();
require("./startup/validation")();
require("./startup/passport")(app);
require("./startup/routes")(app);
require("./startup/swagger")(app);

let port;
if (process.env.NODE_ENV !== "test") {
  port = process.env.PORT || 5000;
} else {
  port = 5001;
}

const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
