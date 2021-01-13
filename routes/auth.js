const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const { User, validate: validateUser } = require("../models/user");
const _ = require("lodash");

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

function validateCredentials(req) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(req);
}

module.exports = router;
