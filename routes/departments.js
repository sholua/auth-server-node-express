const { Department, validate } = require("../models/department");
const router = require("express").Router();
const passport = require("passport");
const { combineJoiErrorMessages } = require("../utilities/common");
const _ = require("lodash");
const ObjectId = require("mongoose").Types.ObjectId;
const checkObjectId = require("../middleware/checkObjectId");

/**
 * @swagger
 * /api/departments:
 *  post:
 *    summary: Create new department
 *    tags:
 *      - Departments
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
 *        description: New department
 *      '400':
 *        description: Bad request (errors in form fields)
 *      '5xx':
 *        description: Unexpected error
 */
router.post(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const department = new Department({ name: req.body.name });
    await department.save();

    res.status(201).send(_.pick(department, ["_id", "name"]));
  }
);

/**
 * @swagger
 * /api/departments:
 *  get:
 *    summary: Get all departments
 *    tags:
 *      - Departments
 *    responses:
 *      '200':
 *        description: Array of departments
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/", async (req, res) => {
  const departments = await Department.find().select("-__v");
  res.status(200).send(departments);
});

/**
 * @swagger
 * /api/departments/{id}:
 *  get:
 *    summary: Get department by id
 *    tags:
 *      - Departments
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    responses:
 *      '200':
 *        description: Department
 *      '5xx':
 *        description: Unexpected error
 */
router.get("/:id", checkObjectId, async (req, res) => {
  const department = await Department.findById(req.params.id).select("-__v");

  if (!department) return res.status(404).send("Deaprtment was not found.");

  res.status(200).send(department);
});

/**
 * @swagger
 * /api/departments/{id}:
 *  put:
 *    summary: Update department
 *    tags:
 *      - Departments
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
 */
router.put(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  checkObjectId,
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(combineJoiErrorMessages(error));

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
        },
      },
      { new: true }
    );

    if (!department) return res.status(404).send("Department was not found.");

    res.status(200).send(department);
  }
);

/**
 * @swagger
 * /api/departments/{id}:
 *  delete:
 *    summary: Delete department by id
 *    tags:
 *      - Departments
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
  checkObjectId,
  async (req, res) => {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
    });
    if (!department) return res.status(404).send("Department was not found.");

    res.status(200).send(department);
  }
);

module.exports = router;
