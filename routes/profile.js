const router = require("express").Router();
const passport = require("passport");
const { User } = require("../models/user");
const grantAccess = require("../middleware/grantAccess");
const uploadImage = require("../middleware/upload");

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

router.post("/upload/avatar", async (req, res) => {
  try {
    await uploadImage(req, res);

    if (req.file === undefined) {
      return res.status(400).send("Please upload a file!");
    }

    res.status(200).send("Uploaded the file successfully: ");
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send("File size cannot be larger than 2MB!");
    }

    res.status(500).send(`Could not upload the file: ${err}`);
  }
});

module.exports = router;
