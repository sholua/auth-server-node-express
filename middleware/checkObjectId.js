const ObjectId = require("mongoose").Types.ObjectId;

module.exports = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Wrong department id.");

  next();
};
