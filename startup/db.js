const config = require("config");

module.exports = function () {
  const mongoose = require("mongoose");
  const winston = require("winston");

  const { MONGO_HOSTNAME } = process.env;

  const options = {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    connectTimeoutMS: 10000,
  };

  const url = `mongodb://${MONGO_HOSTNAME}/${config.get("mongoDb")}`;

  mongoose.connect(url, options).then(function () {
    winston.info("MongoDB is connected");
  });
};
