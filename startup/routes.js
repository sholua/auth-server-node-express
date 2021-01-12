const express = require("express");
const cors = require("cors");
const users = require("../routes/users");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/users", users);
  app.use(error);
};
