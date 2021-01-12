const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

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

const User = mongoose.model("User", userScheme);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
