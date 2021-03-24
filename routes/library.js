const { Note, validate } = require("../models/note");
const router = require("express").Router();
const passport = require("passport");
const { combineJoiErrorMessages } = require("../utilities/common");
const _ = require("lodash");
const checkObjectId = require("../middleware/checkObjectId");
const grantAccess = require("../middleware/grantAccess");

/**
 * @swagger
 * /api/library:
 *  post:
 *    summary: Create new item
 *    tags:
 *      - Library
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *      - in: body
 *        name: name
 *        type: string
 *        required: true
 *      - in: body
 *        name: file
 *        type: string
 *        required: true
 *      - in: body
 *        name: author
 *        type: string
 *        required: true
 *      - in: body
 *        name: type
 *        schema:
 *          type: string
 *          enum: [polyphony, big_form, etude, piece, exercise, duet, trio]
 *        required: true
 *      - in: body
 *        name: publisher
 *        type: string
 *        format: uuid
 *      - in: body
 *        name: instrument
 *        type: string
 *        format: uuid
 *      - in: body
 *        name: grade
 *        example: 1
 *        schema:
 *          type: number
 *          enum: [0, 1, 2, 3, 4, 5, 6, 7, 8]
 *    responses:
 *      '200':
 *        description: New item
 *      '400':
 *        description: Bad request (user's error)
 *      '5xx':
 *        description: Unexpected error
 */
router.post(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("createAny", "note"),
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const note = new Note(
      _.pick(req.body, [
        "name",
        "file",
        "author",
        "type",
        "publisher",
        "instrument",
        "grade",
      ])
    );
    await note.save();

    res.status(201).send(note);
  }
);

/**
 * @swagger
 * /api/library:
 *  get:
 *    summary: Get all items of the library
 *    tags:
 *      - Library
 *    responses:
 *      '200':
 *        description: Array of items
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/", async (req, res) => {
  const notes = await Note.find()
    .populate("publisher", "firstName")
    .populate("instrument", "name")
    .select("-__v");
  res.status(200).send(notes);
});

/**
 * @swagger
 * /api/library/{id}:
 *  get:
 *    summary: Get notes by id
 *    tags:
 *      - Library
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    responses:
 *      '200':
 *        description: Note
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/:id", checkObjectId, async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate("publisher", "firstName email")
    .populate("instrument", "name")
    .select("-__v");

  if (!note) return res.status(404).send("Note was not found.");

  res.status(200).send(note);
});

/**
 * @swagger
 * /api/library/{id}:
 *  put:
 *    summary: Update note
 *    tags:
 *      - Library
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *      - in: body
 *        name: name
 *        type: string
 *        required: true
 *      - in: body
 *        name: file
 *        type: string
 *        required: true
 *      - in: body
 *        name: author
 *        type: string
 *        required: true
 *      - in: body
 *        name: type
 *        schema:
 *          type: string
 *          enum: [polyphony, big_form, etude, piece, exercise, duet, trio]
 *        required: true
 *      - in: body
 *        name: publisher
 *        type: string
 *        format: uuid
 *      - in: body
 *        name: instrument
 *        type: string
 *        format: uuid
 *      - in: body
 *        name: grade
 *        example: 1
 *        schema:
 *          type: number
 *          enum: [0, 1, 2, 3, 4, 5, 6, 7, 8]
 */
router.put(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("updateAny", "note"),
  checkObjectId,
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
        },
      },
      { new: true }
    );

    if (!note) return res.status(404).send("Note was not found.");

    res.status(200).send(note);
  }
);

/**
 * @swagger
 * /api/library/{id}:
 *  delete:
 *    summary: Delete note by id
 *    tags:
 *      - Library
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *      - in: path
 *        name: id
 *        required: true
 */
router.delete(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("deleteAny", "note"),
  checkObjectId,
  async (req, res) => {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
    });
    if (!note) return res.status(404).send("Note was not found.");

    res.status(200).send(note);
  }
);

module.exports = router;
