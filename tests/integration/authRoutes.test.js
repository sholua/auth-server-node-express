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

    it("should return 400 if credentials are not valid", async () => {
      credentials = {
        email: "e",
        password: "p",
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid email", async () => {
      credentials = {
        email: "test2@test.com",
        password: "123456qW!",
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid password", async () => {
      credentials = {
        email: "test@test.com",
        password: "123456qW!!!",
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("POST /refresh_token", () => {});
});
