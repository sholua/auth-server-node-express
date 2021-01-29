const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const { User, validate } = require("../models/user");
const { Token } = require("../models/token");
const {
  buildResetPasswordTemplate,
  transporter,
} = require("../utilities/email");

function validateCredentials(req) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(req);
}

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    ////
    const errors = {};
    error.details.forEach((item) => {
      if (!errors[item.context.key]) errors[item.context.key] = [item.message];
      else errors[item.context.key].push(item.message);
    });
    ////

    return res.status(400).send(errors);
  }

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
    .send(_.pick(user, ["_id", "name", "email"]));
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
    .send(_.pick(user, ["_id", "name", "email"]));
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
    expiresIn: "10m",
  });

  res.status(200).send({ accessToken });
});

router.delete("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  await Token.findOneAndDelete({ token: refreshToken });

  res.status(200).send({ message: "User logged out!" });
});

router.post("/reset_password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).send({ message: "No user with that email" });

  const { _id: userId, password: passwordHash, createdAt } = user;
  const secret = passwordHash + "-" + createdAt;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: "10m",
  });

  // url for React app
  const resetUrl = `${req.headers["x-forwarded-proto"]}://${req.headers.host}/new_password/${userId}/${token}`;
  const emailTemplate = buildResetPasswordTemplate(user, resetUrl);

  transporter.sendMail(emailTemplate, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error sending email");
    }

    res.status(200).send("Email sent.");
  });
});

router.post("/new_password", async (req, res) => {
  const { userId, token, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).send("Invalid user.");

  try {
    const secret = user.password + "-" + user.createdAt;
    const payload = jwt.verify(token, secret);
    if (payload.userId !== user._id.toString())
      return res.status(400).send("Invalid user.");

    user.password = newPassword;
    await user.save();
  } catch (ex) {
    if (ex.name === "TokenExpiredError")
      return res.status(401).send("Reset password token expired.");

    return res.status(400).send("Wrong reset password token.");
  }

  res.status(202).send("Password changed.");
});

module.exports = router;
