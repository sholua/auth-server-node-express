const { User } = require("../models/user");
const router = require("express").Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const users = await User.find().select("_id name email");
  res.send({ users });
});

module.exports = router;
