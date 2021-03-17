const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User, validate } = require("../../models/user");
const { combineJoiErrorMessages } = require("../../utilities/common");

const passportConfig = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
  session: false,
};

passport.use(
  "local-register",
  new LocalStrategy(passportConfig, async (req, email, password, done) => {
    const { error } = validate(req.body);
    if (error) return done(null, false, combineJoiErrorMessages(error));

    let user = await User.findOne({ email });
    if (user) return done(null, false, { email: "Email already registered." });

    user = new User({
      firstName: req.body.firstName,
      email,
      password,
    });

    return done(null, user);
  })
);

passport.use(
  "local-login",
  new LocalStrategy(passportConfig, async (req, email, password, done) => {
    const user = await User.findOne({ email });

    if (!user)
      return done(null, false, { message: "Invalid email or password." });

    const validPassword = await user.verifyPassword(password);
    if (!validPassword)
      return done(null, false, { message: "Invalid email or password." });

    return done(null, user);
  })
);
