const passport = require("passport");
const passportJwt = require("passport-jwt");
const config = require("config");
const { User } = require("../../models/user");

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: config.get("accessTokenSecret"),
};

passport.use(
  new passportJwt.Strategy(jwtOptions, async (payload, done) => {
    if (payload._id) return done(null, payload);
  })
);
