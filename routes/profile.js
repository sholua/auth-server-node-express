const router = require("express").Router();
const passport = require("passport");
const { User } = require("../models/user");
const grantAccess = require("../middleware/grantAccess");
const uploadImage = require("../middleware/upload");
const config = require("config");
const fs = require("fs");

/**
 * @swagger
 * /api/profile/{id}:
 *  get:
 *    summary: Get profile by user id
 *    tags:
 *      - Profile
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *      - in: header
 *        name: Authorization
 *        type: string
 *        required: true
 *        example: JWT xxxxxAccessTokenxxxxx
 *    responses:
 *      '200':
 *        description: Object with user info
 *      '401':
 *        description: Authorization information is missing or invalid
 *      '404':
 *        description: Profile with the specified ID was not found
 *      '5xx':
 *        description: Unexpected error.
 */
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

/**
 * @swagger
 * /api/profile/upload/avatar:
 *  post:
 *    summary: Upload avatar
 *    tags:
 *      - Profile
 *    consumers:
 *      - multipart/form-data
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        type: string
 *        required: true
 *        example: JWT xxxxxAccessTokenxxxxx
 *      - in: formData
 *        name: avatar
 *        type: file
 *        required: true
 *        description: Image to upload (jpg, jpeg, png)
 *    responses:
 *      '200':
 *        description: User with new avatar
 *      '401':
 *        description: Authorization information is missing or invalid
 *      '5xx':
 *        description: Unexpected error.
 */
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

      res.status(400).send(err);
    }
  }
);

/**
 * @swagger
 * /api/profile/avatar/{name}:
 *  get:
 *    summary: Get profile's avatar
 *    tags:
 *      - Profile
 *    parameters:
 *      - in: path
 *        name: name
 *        schema:
 *          type: string
 *        required: true
 *    responses:
 *      '200':
 *        description: Download avatar
 *      '401':
 *        description: Authorization information is missing or invalid
 *      '404':
 *        description: Avatar not found
 *      '5xx':
 *        description: Unexpected error.
 */
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
