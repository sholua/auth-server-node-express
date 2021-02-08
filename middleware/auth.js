const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const bearer = req.header("Authorization");
  const accessToken = bearer.split(" ")[1];
  if (!bearer || !accessToken)
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
