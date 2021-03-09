const Joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity").default;
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userScheme = new mongoose.Schema(
  {
    firstName: {
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
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userScheme.methods = {
  verifyPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },

  generateAccessToken: function () {
    const accessToken = jwt.sign(
      { _id: this._id, firstName: this.firstName },
      config.get("accessTokenSecret"),
      {
        expiresIn: config.get("accessTokenTime"),
      }
    );

    return accessToken;
  },

  generateRefreshToken: function () {
    const refreshToken = jwt.sign(
      { _id: this._id },
      config.get("refreshTokenSecret"),
      {
        expiresIn: config.get("refreshTokenTime"),
      }
    );

    return refreshToken;
  },

  generateResetPasswordToken: function () {
    const userId = this._id;
    const secret = `${this.password}-${this.createdAt}`;
    const token = jwt.sign({ userId }, secret, {
      expiresIn: config.get("resetPasswordTokenTime"),
    });

    return token;
  },
};

userScheme.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

const User = mongoose.model("User", userScheme);

function validate(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(4).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: passwordComplexity().required(),
  });

  return schema.validate(user);
}

function validatePassword(password) {
  const schema = Joi.object({
    newPassword: passwordComplexity().required().label("Password"),
  });

  return schema.validate(password);
}

exports.User = User;
exports.validate = validate;
exports.validatePassword = validatePassword;
