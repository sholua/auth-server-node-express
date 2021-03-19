const router = require("express").Router();
const passport = require("passport");
const { User } = require("../models/user");
const grantAccess = require("../middleware/grantAccess");

router.get(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("readOwn", "profile"),
  async (req, res) => {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -__v"
    );

    return res.status(200).send(user);
  }
);

module.exports = router;
