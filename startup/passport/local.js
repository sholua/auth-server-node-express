const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../../models/user");

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      const user = await User.findOne({ email });

      if (!user)
        return done(null, false, { message: "Invalid email or password." });

      const validPassword = await user.verifyPassword(password);
      if (!validPassword)
        return done(null, false, { message: "Invalid email or password." });

      return done(null, user);
    }
  )
);
