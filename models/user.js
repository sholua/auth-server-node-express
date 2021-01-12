const Joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity").default;
const config = require("config");
const jwt = require("jsonwebtoken");

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

userScheme.methods.generateAuthTokens = function () {
  const accessToken = jwt.sign(
    { _id: this._id },
    config.get("accessTokenSecret")
  );
  const refreshToken = jwt.sign(
    { _id: this._id },
    config.get("refreshTokenSecret")
  );
  return { accessToken, refreshToken };
};

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
