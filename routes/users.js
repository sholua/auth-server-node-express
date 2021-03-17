const { User } = require("../models/user");
const router = require("express").Router();
const _ = require("lodash");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  async (req, res) => {
    const users = await User.find().select("_id firstName email");
    res.send(users);
  }
);

module.exports = router;
