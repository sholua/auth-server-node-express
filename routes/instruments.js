const { Instrument, validate } = require("../models/instrument");
const router = require("express").Router();
const passport = require("passport");
const { combineJoiErrorMessages } = require("../utilities/common");
const _ = require("lodash");
const checkObjectId = require("../middleware/checkObjectId");
const grantAccess = require("../middleware/grantAccess");

/**
 * @swagger
 * /api/instruments:
 *  post:
 *    summary: Create new instrument
 *    tags:
 *      - Instruments
 *    parameters:
 *      - in: body
 *        name: name
 *        type: string
 *        required: true
 *      - in: header
 *        name: Authorization
 *        required: true
 *    responses:
 *      '200':
 *        description: New instrument
 *      '400':
 *        description: Bad request (errors in form fields)
 *      '5xx':
 *        description: Unexpected error
 */
router.post(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("createAny", "instrument"),
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const instrument = new Instrument({
      name: req.body.name,
      description: req.body.description || "",
    });
    await instrument.save();

    res.status(201).send(_.pick(instrument, ["_id", "name", "description"]));
  }
);

/**
 * @swagger
 * /api/instruments:
 *  get:
 *    summary: Get all instruments
 *    tags:
 *      - Instruments
 *    responses:
 *      '200':
 *        description: Array of instruments
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/", async (req, res) => {
  const instruments = await Instrument.find().select("-__v");
  res.status(200).send(instruments);
});

/**
 * @swagger
 * /api/instruments/{id}:
 *  get:
 *    summary: Get instrument by id
 *    tags:
 *      - Instruments
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    responses:
 *      '200':
 *        description: Instrument
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/:id", checkObjectId, async (req, res) => {
  const instrument = await Instrument.findById(req.params.id).select("-__v");

  if (!instrument) return res.status(404).send("Instrument was not found.");

  res.status(200).send(instrument);
});

/**
 * @swagger
 * /api/instruments/{id}:
 *  put:
 *    summary: Update instrument
 *    tags:
 *      - Instruments
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *      - in: body
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *              required: true
 *            description:
 *              type: string
 */
router.put(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  grantAccess("updateAny", "instrument"),
  checkObjectId,
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const instrument = await Instrument.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
        },
      },
      { new: true }
    );

    if (!instrument) return res.status(404).send("Instrument was not found.");

    res.status(200).send(instrument);
  }
);

/**
 * @swagger
 * /api/instruments/{id}:
 *  delete:
 *    summary: Delete instrument by id
 *    tags:
 *      - Instruments
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
  grantAccess("deleteAny", "instrument"),
  checkObjectId,
  async (req, res) => {
    const instrument = await Instrument.findOneAndDelete({
      _id: req.params.id,
    });
    if (!instrument) return res.status(404).send("Instrument was not found.");

    res.status(200).send(instrument);
  }
);

module.exports = router;
