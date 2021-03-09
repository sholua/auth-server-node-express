const { User } = require("../../../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

describe("user model methods", () => {
  it("should return a valid access token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
    };
    const user = new User(payload);
    const token = user.generateAccessToken();
    const decoded = jwt.verify(token, config.get("accessTokenSecret"));
    expect(decoded).toMatchObject(payload);
  });

  it("should return a valid refresh token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
    };
    const user = new User(payload);
    const token = user.generateRefreshToken();
    const decoded = jwt.verify(token, config.get("refreshTokenSecret"));
    expect(decoded).toMatchObject(payload);
  });
});
