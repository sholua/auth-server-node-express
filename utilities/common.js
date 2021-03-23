const fs = require("fs");
const sharp = require("sharp");

const combineJoiErrorMessages = (joiError) => {
  const errors = {};
  joiError.details.forEach((item) => {
    if (!errors[item.context.key]) errors[item.context.key] = [item.message];
    else errors[item.context.key].push(item.message);
  });

  return errors;
};

const resizeImage = (path, format, widthString, heightString) => {
  // Parse to integer if possible
  let width, height;
  if (widthString) {
    width = parseInt(widthString);
  }
  if (heightString) {
    height = parseInt(heightString);
  }

  const readStream = fs.createReadStream(path);
  let transform = sharp();

  if (format) {
    transform = transform.toFormat(format);
  }

  if (width || height) {
    transform = transform.resize(width, height);
  }

  return readStream.pipe(transform);
};

module.exports = {
  combineJoiErrorMessages,
  resizeImage,
};
