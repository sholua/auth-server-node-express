const mongoose = require("mongoose");
const Joi = require("joi");

const instrumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
      trim: true,
    },
    description: String,
  },
  { timestamps: true }
);

const Instrument = mongoose.model("Instrument", instrumentSchema);

function validate(instrument) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    description: Joi.string(),
  });

  return schema.validate(instrument);
}

exports.Instrument = Instrument;
exports.validate = validate;
