const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({
  storage,
  limits: { fileSize: maxSize },
}).single("avatar");

let uploadImageMiddleware = util.promisify(uploadImage);

module.exports = uploadImageMiddleware;
