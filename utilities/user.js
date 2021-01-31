const _ = require("lodash");

const pickLoggedUserFields = (user) => {
  return _.pick(user, ["_id", "name", "email"]);
};

module.exports = {
  pickLoggedUserFields,
};
