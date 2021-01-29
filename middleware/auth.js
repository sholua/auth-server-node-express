const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const accessToken = req.header("Authorization").split(" ")[1];
  if (!accessToken)
    return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(accessToken, config.get("accessTokenSecret"));
    req.user = decoded;
    next();
  } catch (ex) {
    if (ex.name === "TokenExpiredError")
      return res.status(401).send("Session timed out, please login again.");

    res.status(400).send("Invalid token.");
  }
};
