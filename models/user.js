const Joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity").default;
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Token } = require("./token");

const userScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
});

userScheme.methods = {
  generateAccessToken: function () {
    const accessToken = jwt.sign(
      { _id: this._id },
      config.get("accessTokenSecret"),
      {
        expiresIn: "15s",
      }
    );

    return accessToken;
  },

  generateRefreshToken: async function () {
    const refreshToken = jwt.sign(
      { _id: this._id },
      config.get("refreshTokenSecret"),
      {
        expiresIn: "1d",
      }
    );

    await new Token({ token: refreshToken }).save();

    return refreshToken;
  },
};

userScheme.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

const User = mongoose.model("User", userScheme);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: passwordComplexity().required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
