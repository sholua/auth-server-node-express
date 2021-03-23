const mongoose = require("mongoose");
const Joi = require("joi");

const noteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
      trim: true,
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
    publisher: mongoose.Types.ObjectId,
    department: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    instrument: mongoose.Types.ObjectId,
    grade: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    contest: Boolean,
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

function validate(note) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    author: Joi.string().min(4).max(50).required(),
    publisher: Joi.ObjectId(),
  });

  return schema.validate(note);
}

exports.Note = Note;
exports.validate = validate;
