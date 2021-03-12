const request = require("supertest");
const { User } = require("../../models/user");

let server;

describe("/api/users", () => {
  beforeEach(() => (server = require("../../index")));
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all users", async () => {
      const users = [
        { firstName: "Test1", email: "test1@test.com", password: "123456qW!" },
        { firstName: "Test2", email: "test2@test.com", password: "123456qW!" },
      ];

      await User.collection.insertMany(users);

      const res = await request(server)
        .get("/api/users")
        .set("Authorization", `JWT ${new User().generateAccessToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((u) => u.firstName === "Test1")).toBeTruthy();
      expect(res.body.some((u) => u.firstName === "Test2")).toBeTruthy();
    });
  });
});
