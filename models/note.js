const mongoose = require("mongoose");
const Joi = require("joi");

// musical notes (pdf)
const noteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
      trim: true,
    },
    file: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "polyphony",
        "big_form",
        "etude",
        "piece",
        "exercise",
        "duet",
        "trio",
      ],
    },
    publisher: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    instrument: {
      type: mongoose.Types.ObjectId,
      ref: "Instrument",
    },
    grade: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

function validate(note) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    file: Joi.string().required(),
    author: Joi.string().min(4).max(50).required(),
    type: Joi.string()
      .valid(
        "polyphony",
        "big_form",
        "etude",
        "piece",
        "exercise",
        "duet",
        "trio"
      )
      .required(),
    publisher: Joi.objectId(),
    instrument: Joi.objectId(),
    grade: Joi.number().valid(0, 1, 2, 3, 4, 5, 6, 7, 8),
  });

  return schema.validate(note);
}

exports.Note = Note;
exports.validate = validate;
