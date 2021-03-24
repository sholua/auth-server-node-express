const AccessControl = require("accesscontrol");
const ac = new AccessControl();

module.exports = (function () {
  ac.grant("basic").readOwn("profile");

  ac.grant("pupil").extend("basic").updateOwn("profile");

  ac.grant("teacher").extend(["basic", "pupil"]).readAny("profile");

  ac.grant("admin")
    .extend(["basic", "pupil", "teacher"])
    .updateAny("profile")
    .deleteAny("profile")
    .createAny("department")
    .updateAny("department")
    .deleteAny("department");

  return ac;
})();
