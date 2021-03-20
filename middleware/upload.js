const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;

module.exports = function (formFieldName) {
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
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(
        `Error: File upload only supports the following filetypes - ${filetypes}`
      );
    },
  }).single(formFieldName);

  return util.promisify(uploadImage);
};
