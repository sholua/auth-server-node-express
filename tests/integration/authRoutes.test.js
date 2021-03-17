const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../models/user");

let server;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  describe("POST /register", () => {
    let user;

    const exec = async () => {
      return await request(server).post("/api/auth/register").send(user);
    };

    beforeEach(() => {
      user = {
        firstName: "Shol",
        email: "test@test.com",
        password: "123456qW!",
      };
    });

    it("should register new user", async () => {
      const res = await exec();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("firstName", user.firstName);
      expect(res.body).toHaveProperty("email", user.email);
      expect(res.header).toHaveProperty("x-access-token");
      expect(res.header).toHaveProperty("x-refresh-token");
      expect(res.body).toHaveProperty("_id");
    });

    it("should return 400 if user is invalid", async () => {
      user = {};

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is already registered", async () => {
      const users = [
        { firstName: "Test1", email: "test@test.com", password: "123456qW!" },
        { firstName: "Test2", email: "test2@test.com", password: "123456qW!" },
      ];
      await User.collection.insertMany(users);

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("POST /login", () => {
    let credentials;

    const exec = async () => {
      return await request(server).post("/api/auth/login").send(credentials);
    };

    beforeEach(async () => {
      credentials = {
        email: "test@test.com",
        password: "123456qW!",
      };

      const user = new User({
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      });
      await user.save();
    });

    it("should login the user with given credentials", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.header).toHaveProperty("x-access-token");
      expect(res.header).toHaveProperty("x-refresh-token");
      expect(res.body).toHaveProperty("firstName", "Test");
    });

    it("should return 401 if credentials are not valid", async () => {
      credentials = {
        email: "e",
        password: "p",
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if invalid email", async () => {
      credentials = {
        email: "test2@test.com",
        password: "123456qW!",
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if invalid password", async () => {
      credentials = {
        email: "test@test.com",
        password: "123456qW!!!",
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });
  });

  describe("POST /refresh_token", () => {
    let user;
    let refreshToken;

    const exec = async () => {
      return await request(server)
        .post("/api/auth/refresh_token")
        .send({ refreshToken });
    };

    beforeEach(async () => {
      user = new User({
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      });

      refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();
    });

    it("should return 201 if new access and refresh tokens created", async () => {
      const res = await exec();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should return 403 if not refreshToken provided", async () => {
      refreshToken = "";

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 401 if invalid refresh token provided", async () => {
      refreshToken = new User().generateRefreshToken();

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if stolen refreshToken was used", async () => {
      refreshToken = new User().generateRefreshToken();

      const res = await exec();

      expect(res.status).toBe(401);
    });
  });

  describe("GET /me", () => {
    let user;
    let accessToken;

    const exec = async () => {
      return await request(server)
        .get("/api/auth/me")
        .set("Authorization", `JWT ${accessToken}`)
        .send();
    };

    beforeEach(async () => {
      user = new User({
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      });

      user = await user.save();
      accessToken = user.generateAccessToken();
    });

    it("should return current logged in user", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
    });
  });

  describe("DELETE /logout", () => {
    let user;
    let accessToken;
    let refreshToken;

    const exec = async () => {
      return await request(server)
        .delete("/api/auth/logout")
        .set("Authorization", `JWT ${accessToken}`)
        .send({ params: { refreshToken } });
    };

    beforeEach(async () => {
      user = new User({
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      });

      user = await user.save();
      accessToken = user.generateAccessToken();
      refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();
    });

    it("should return 200 if user logged out", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 401 if no refresh token provided", async () => {
      refreshToken = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });
  });

  describe("POST /forgot_password", () => {
    let user;
    let email;

    const exec = async () => {
      return await request(server)
        .post("/api/auth/forgot_password")
        .send({ email });
    };

    beforeEach(async () => {
      email = "test@test.com";

      user = new User({
        firstName: "Test",
        email,
        password: "123456qW!",
      });

      await user.save();
    });

    it("should return 200 if email sent", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("shoul return 404 if no user found", async () => {
      email = "wrong@test.com";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("shoul return 400 if no email provided", async () => {
      email = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("POST /reset_password", () => {
    let user;
    let userId;
    let token;
    let newPassword;

    const exec = async () => {
      return await request(server)
        .post("/api/auth/reset_password")
        .send({ userId, token, newPassword });
    };

    beforeEach(async () => {
      user = new User({
        firstName: "Test",
        email: "test@test.com",
        password: "123456qW!",
      });

      user = await user.save();
      userId = user._id;
      newPassword = "654321qW!";
      token = user.generateResetPasswordToken();
    });

    it("should return 202 if password was changed", async () => {
      const res = await exec();

      expect(res.status).toBe(202);
    });

    it("should return 400 if invalid userId", async () => {
      userId = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if no token provided", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid reset password token", async () => {
      token = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if not new password provided", async () => {
      newPassword = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if bad new password provided", async () => {
      newPassword = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
