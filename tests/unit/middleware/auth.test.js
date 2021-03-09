const mongoose = require("mongoose");
const auth = require("../../../middleware/auth");
const { User } = require("../../../models/user");

describe("auth middleware", () => {
  it("should populate req.user with a payload of valid access token", () => {
    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
    };
    const accessToken = new User(user).generateAccessToken();
    const req = {
      header: jest.fn().mockReturnValue(`Brearer ${accessToken}`),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
