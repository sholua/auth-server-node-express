const passport = require("passport");
const router = require("express").Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, validatePassword } = require("../models/user");
const { combineJoiErrorMessages } = require("../utilities/common");
const { pickLoggedUserFields } = require("../utilities/user");
const {
  buildResetPasswordTemplate,
  transporter,
} = require("../utilities/email");

router.post("/register", async (req, res, next) => {
  passport.authenticate(
    "local-register",
    { session: false },
    async (err, user, info) => {
      if (err) return res.status(500).send("Error");

      if (!user && info) {
        return res.status(400).send(info);
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      res
        .header("x-access-token", accessToken)
        .header("x-refresh-token", refreshToken)
        .status(201)
        .send(pickLoggedUserFields(user));
    }
  )(req, res, next);
});

router.post("/login", async (req, res, next) => {
  passport.authenticate(
    "local-login",
    { session: false },
    async (err, user, info) => {
      if (err) return res.status(401).send("Error");

      if (!user) {
        return res.status(401).send(info.message);
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      res
        .header("x-access-token", accessToken)
        .header("x-refresh-token", refreshToken)
        .send(pickLoggedUserFields(user));
    }
  )(req, res, next);
});

router.post("/refresh_token", async (req, res) => {
  let { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(403).send("Access denied, token missing.");

  const { iat, exp, ...userPayload } = jwt.verify(
    refreshToken,
    config.get("refreshTokenSecret")
  );

  const user = await User.findById(userPayload._id);
  if (!user) return res.status(401).send("Invalid refresh token.");

  if (user.refreshToken !== refreshToken) {
    user.refreshToken = "";
    await user.save();
    return res.status(401).send("Refresh token was stolen.");
  }

  const accessToken = user.generateAccessToken();
  refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).send({ accessToken, refreshToken });
});

router.get(
  "/me",
  passport.authenticate(["jwt"], { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).send(pickLoggedUserFields(user));
  }
);

router.delete(
  "/logout",
  passport.authenticate(["jwt"], { session: false }),
  async (req, res) => {
    const { refreshToken } = req.body.params;
    if (!refreshToken) return res.status(401).send("No token provided.");

    const decodedRefreshToken = jwt.verify(
      refreshToken,
      config.get("refreshTokenSecret")
    );
    const user = await User.findById(decodedRefreshToken._id);
    user.refreshToken = "";
    await user.save();

    res.status(200).send("User logged out!");
  }
);

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("No email provided.");

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ email: "No user with that email" });

  // // url for React app
  const token = user.generateResetPasswordToken();
  const resetUrl = `${req.headers["x-forwarded-proto"]}://${req.headers.host}/reset_password/${user._id}/${token}`;
  const emailTemplate = buildResetPasswordTemplate(user, resetUrl);

  transporter.sendMail(emailTemplate, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error sending email");
    }

    res.status(200).send("Email sent.");
  });
});

router.post("/reset_password", async (req, res) => {
  const { userId, token, newPassword } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid user id");

  const { error } = validatePassword({ newPassword });
  if (error) return res.status(400).send(combineJoiErrorMessages(error));

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

router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async function (req, res) {
    const accessToken = req.user.generateAccessToken();
    const refreshToken = req.user.generateRefreshToken();
    req.user.refreshToken = refreshToken;
    await req.user.save();

    res.render("authenticated.html", { accessToken, refreshToken });
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    session: false,
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  async function (req, res) {
    const accessToken = req.user.generateAccessToken();
    const refreshToken = req.user.generateRefreshToken();
    req.user.refreshToken = refreshToken;
    await req.user.save();

    res.render("authenticated.html", { accessToken, refreshToken });
  }
);

module.exports = router;
