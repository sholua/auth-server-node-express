const winston = require("winston");
require("express-async-errors");

module.exports = function () {
  winston.add(
    new winston.transports.File({
      level: "error",
      filename: "logfile.log",
      format: winston.format.json(),
      handleExceptions: true,
    })
  );

  if (process.env.NODE_ENV !== "production") {
    winston.add(
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  process.on("uncaughtException", (ex) => {
    winston.error(ex.message, ex);
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
