const request = require("supertest");
const { User } = require("../../models/user");
const fs = require("fs");
const path = require("path");

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

  describe("POST /upload/avatar", () => {
    let accessToken;
    let avatar;
    let filePath;

    const exec = async () => {
      return await request(server)
        .post("/api/profile/upload/avatar")
        .set("Authorization", `JWT ${accessToken}`)
        .attach("avatar", filePath);
    };

    beforeEach(async () => {
      const userCredentials = {
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
        role: "admin",
      };

      const user = new User(userCredentials);
      accessToken = user.generateAccessToken();
      filePath = `${__dirname}/testFiles/test.jpg`;
      await user.save();
    });

    afterEach(() => {
      if (avatar) {
        fs.unlinkSync(path.join(__dirname + "/../../uploads/" + avatar));
        avatar = undefined;
      }
    });

    it("should upload/download jpg image", async () => {
      const res = await exec();

      avatar = res.body.avatar;
      expect(res.status).toBe(200);

      const res2 = await request(server)
        .get(`/api/profile/avatar/${avatar}`)
        .set("Authorization", `JWT ${accessToken}`);

      expect(res2.status).toBe(200);
    });

    it("should not upload with empty avatar field of the form", async () => {
      filePath = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should not upload file with wrong extention", async () => {
      filePath = `${__dirname}/testFiles/test.txt`;

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
