const _ = require("lodash");

const pickLoggedUserFields = (user) => {
  return _.pick(user, ["_id", "firstName", "email", "role", "avatar"]);
};

module.exports = {
  pickLoggedUserFields,
};
