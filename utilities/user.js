const _ = require("lodash");

const pickLoggedUserFields = (user) => {
  return _.pick(user, ["_id", "firstName", "email"]);
};

module.exports = {
  pickLoggedUserFields,
};
