const request = require("supertest");
const { User } = require("../../models/user");

let server;

describe("/api/profile", () => {
  beforeEach(() => (server = require("../../index")));
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  describe("GET /", () => {
    let userId;

    beforeEach(async () => {
      const userCredentials = {
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      };

      const user = new User(userCredentials);

      await user.save();
      userId = user._id;
    });

    it("should return user by id", async () => {
      const res = await request(server)
        .get(`/api/profile/${userId}`)
        .set(
          "Authorization",
          `JWT ${new User({ role: "admin" }).generateAccessToken()}`
        );

      expect(res.status).toBe(200);
    });
  });
});
