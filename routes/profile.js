const router = require("express").Router();
const passport = require("passport");
const { User } = require("../models/user");
const grantAccess = require("../middleware/grantAccess");
const uploadImage = require("../middleware/upload");
const config = require("config");
const fs = require("fs");

router.get(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("readOwn", "profile"),
  async (req, res) => {
    const user = await User.findById(req.params.id).select(
      config.get("userSensitiveFields")
    );

    return res.status(200).send(user);
  }
);

router.post(
  "/upload/avatar",
  passport.authenticate(["jwt"], { session: false }),
  async (req, res) => {
    try {
      await uploadImage("avatar")(req, res);

      if (req.file === undefined) {
        return res.status(400).send("Please upload a file!");
      }

      const user = await User.findById(req.user._id).select(
        config.get("userSensitiveFields")
      );
      if (user.avatar) {
        const pathToOldAvatar = `${__basedir}/uploads/${user.avatar}`;
        fs.unlink(pathToOldAvatar, (err) => {
          if (err) return;
        });
      }
      user.avatar = req.file.filename;
      await user.save();

      res.status(200).send(user);
    } catch (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File size cannot be larger than 2MB!");
      }

      res.status(500).send(err);
    }
  }
);

router.get("/avatar/:name", (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      // There is no file
      res.status(400).send(`Could not download the file.`);
    }
  });
});

module.exports = router;
