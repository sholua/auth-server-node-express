const request = require("supertest");
const { User } = require("../../models/user");

let server;

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
  });

  let accessToken;

  const exec = () => {
    return request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`);
  };

  beforeEach(() => {
    accessToken = new User().generateAccessToken();
  });

  it("should return 401 if no access token was provided", async () => {
    accessToken = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    accessToken = "a";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
