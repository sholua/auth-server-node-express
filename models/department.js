const mongoose = require("mongoose");
const Joi = require("joi");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
      trim: true,
    },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

function validate(department) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required().label("Name"),
  });

  return schema.validate(department);
}

exports.Department = Department;
exports.validate = validate;
