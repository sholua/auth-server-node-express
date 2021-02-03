const combineJoiErrorMessages = (joiError) => {
  const errors = {};
  joiError.details.forEach((item) => {
    if (!errors[item.context.key]) errors[item.context.key] = [item.message];
    else errors[item.context.key].push(item.message);
  });

  return errors;
};

module.exports = {
  combineJoiErrorMessages,
};
