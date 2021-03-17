const passport = require("passport");
const passportGoogle = require("passport-google-oauth20");
const config = require("config");
const { User } = require("../../models/user");

const passportConfig = {
  clientID:
    "280137132910-r91jj87qq5jja4emda2iig1uci2k00ih.apps.googleusercontent.com",
  clientSecret: "DWOeqokV9o5AyJuBTTDPsrF0",
  callbackURL: "http://music-school.me/api/auth/google/callback",
};

if (passportConfig.clientID) {
  passport.use(
    new passportGoogle.Strategy(
      passportConfig,
      async function (accessToken, refreshToken, profile, cb) {
        let user = await User.findOne({ email: profile._json.email });

        if (user) return cb(null, user);

        if (!user) {
          const newUser = {
            firstName: profile.name.givenName,
            email: profile._json.email,
          };

          user = await User.create(newUser);

          return cb(null, user);
        }
      }
    )
  );
}
