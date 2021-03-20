const { User } = require("../models/user");
const router = require("express").Router();
const passport = require("passport");
const grantAccess = require("../middleware/grantAccess");

/**
 * @swagger
 * /api/users:
 *  get:
 *    summary: Get list of users
 *    tags:
 *      - Users
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        type: string
 *        required: true
 *        example: JWT xxxxxAccessTokenxxxxx
 *    description: Get all users
 *    responses:
 *      '200':
 *        description: Array of users
 */
router.get(
  "/",
  passport.authenticate(["jwt"], {
    session: false,
  }),
  grantAccess("readAny", "profile"),
  async (req, res) => {
    const users = await User.find().select("_id firstName email");
    res.send(users);
  }
);

module.exports = router;
