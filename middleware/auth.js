const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const accessToken = req.header("authorization");
  if (!accessToken)
    return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(accessToken, config.get("accessTokenSecret"));
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
