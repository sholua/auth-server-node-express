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
    return request(server).get("/api/users").set("Authorization", accessToken);
  };

  beforeEach(() => {
    accessToken = new User().generateAccessToken();
  });

  it("should return 401 status if no access token was provided", async () => {
    accessToken = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });
});
