const { User, validate } = require("../models/user");
const router = require("express").Router();
const auth = require("../middleware/auth");
const _ = require("lodash");

router.get("/", auth, async (req, res) => {
  const users = await User.find().select("_id name email");
  res.send({ users });
});

router.post("/", async (req, res) => {
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
    .send({ user: _.pick(user, ["_id", "name", "email"]) });
});

module.exports = router;
