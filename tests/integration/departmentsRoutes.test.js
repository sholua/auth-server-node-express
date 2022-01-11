const request = require("supertest");
const mongoose = require("mongoose");
const { Department } = require("../../models/department");
const { User } = require("../../models/user");

let server;

describe("/api/departments", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Department.remove({});
    await server.close();
  });

  describe("POST /", () => {
    let department;

    const exec = async () => {
      return await request(server)
        .post("/api/departments")
        .set(
          "Authorization",
          `JWT ${new User({ role: "admin" }).generateAccessToken()}`
        )
        .send(department);
    };

    beforeEach(() => {
      department = {
        name: "Test department",
      };
    });

    it("should creat new department", async () => {
      const res = await exec();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("name", department.name);
      expect(res.body).toHaveProperty("_id");
    });

    it("should return 400 if name is less then 4 characters long", async () => {
      department.name = "T";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is empty", async () => {
      department.name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("GET /", () => {
    beforeEach(async () => {
      const departments = [{ name: "Test1" }, { name: "Test2" }];

      await Department.collection.insertMany(departments);
    });

    it("should return all departments", async () => {
      const res = await request(server).get("/api/departments");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((u) => u.name === "Test1")).toBeTruthy();
      expect(res.body.some((u) => u.name === "Test2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;

    const exec = async () => {
      return await request(server).get("/api/departments/" + id);
    };

    beforeEach(async () => {
      const newDepartment = new Department({
        name: "Test",
      });
      department = await newDepartment.save();
      id = department._id;
    });

    it("should get department by id", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual(department.name);
    });

    it("should return 400 if wrong department id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if department was not fond", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /:id", () => {
    let id, newDepartment, accessToken;

    const exec = async () => {
      return await request(server)
        .put("/api/departments/" + id)
        .send(newDepartment)
        .set("Authorization", `JWT ${accessToken}`);
    };

    beforeEach(async () => {
      newDepartment = {
        name: "New name",
      };
      accessToken = new User({ role: "admin" }).generateAccessToken();
      let department = new Department({ name: "Test" });
      department = await department.save();
      id = department._id;
    });

    it("should update department", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual("New name");
    });

    it("should return 400 if wrong department id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if empty body request", async () => {
      newDepartment = {};

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if department name is less than 4 characters long", async () => {
      newDepartment.name = "T";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /", () => {
    let id, accessToken;

    const exec = async () => {
      return await request(server)
        .delete("/api/departments/" + id)
        .set("Authorization", `JWT ${accessToken}`);
    };

    beforeEach(async () => {
      accessToken = new User({ role: "admin" }).generateAccessToken();
      let department = {
        name: "Test",
      };
      department = new Department(department);
      department = await department.save();
      id = department._id;
    });

    it("should delete department", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual("Test");
    });

    it("should return 400 if wrong department id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if department was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
