const passport = require("passport");
const passportFacebook = require("passport-facebook");
const config = require("config");
const { User } = require("../../models/user");

const passportConfig = {
  clientID: "149162753731281",
  clientSecret: "50aedf753e3f8a55a103659b1af02784",
  callbackURL: "https://music-school.me/api/auth/facebook/callback",
};

if (passportConfig.clientID) {
  passport.use(
    new passportFacebook.Strategy(
      passportConfig,
      async function (accessToken, refreshToken, profile, cb) {
        console.log("facebook profile", profile);
        // let user = await User.findOne({ email: profile._json.email });

        // if (user) return cb(null, user);

        // if (!user) {
        //   const newUser = {
        //     firstName: profile.name.givenName,
        //     email: profile._json.email,
        //   };

        //   user = await User.create(newUser);

        //   return cb(null, user);
        // }
      }
    )
  );
}
