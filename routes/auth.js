const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const { User, validate: validateUser } = require("../models/user");
const { Token } = require("../models/token");

router.post("/signup", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  await user.save();
  const accessToken = user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res
    .header("x-access-token", accessToken)
    .header("x-refresh-token", refreshToken)
    .status(201)
    .send({ user: _.pick(user, ["_id", "name", "email"]) });
});

router.post("/login", async (req, res) => {
  const { error } = validateCredentials(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const accessToken = user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res
    .header("x-access-token", accessToken)
    .header("x-refresh-token", refreshToken)
    .send({ user: _.pick(user, ["_id", "name", "email"]) });
});

router.post("/refresh_token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(403).send("Access denied, token missing!");

  const tokenDoc = await Token.findOne({ token: refreshToken });
  if (!tokenDoc) return res.status(401).send("Token expired!");

  const { iat, exp, ...userPayload } = jwt.verify(
    tokenDoc.token,
    config.get("refreshTokenSecret")
  );
  const accessToken = jwt.sign(userPayload, config.get("accessTokenSecret"), {
    expiresIn: "15s",
  });

  res.status(200).send({ accessToken });
});

router.delete("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  await Token.findOneAndDelete({ token: refreshToken });

  res.status(200).send({ message: "User logged out!" });
});

function validateCredentials(req) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(req);
}

module.exports = router;
