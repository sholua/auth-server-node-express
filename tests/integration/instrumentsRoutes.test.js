const request = require("supertest");
const mongoose = require("mongoose");
const { Instrument } = require("../../models/instrument");
const { User } = require("../../models/user");

let server;

describe("/api/instruments", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Instrument.remove({});
    await server.close();
  });

  describe("POST /", () => {
    let instrument;

    const exec = async () => {
      return await request(server)
        .post("/api/instruments")
        .set(
          "Authorization",
          `JWT ${new User({ role: "admin" }).generateAccessToken()}`
        )
        .send(instrument);
    };

    beforeEach(() => {
      instrument = {
        name: "Test instrument",
        description: "Instrument description",
      };
    });

    it("should creat new instrument", async () => {
      const res = await exec();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("name", instrument.name);
      expect(res.body).toHaveProperty("description", instrument.description);
      expect(res.body).toHaveProperty("_id");
    });

    it("should return 400 if name is less then 4 characters long", async () => {
      instrument.name = "T";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is empty", async () => {
      instrument.name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("GET /", () => {
    beforeEach(async () => {
      const instruments = [
        { name: "Test1", description: "Description 1" },
        { name: "Test2", description: "Description 2" },
      ];

      await Instrument.collection.insertMany(instruments);
    });

    it("should return all instruments", async () => {
      const res = await request(server).get("/api/instruments");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((u) => u.name === "Test1")).toBeTruthy();
      expect(res.body.some((u) => u.name === "Test2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;

    const exec = async () => {
      return await request(server).get("/api/instruments/" + id);
    };

    beforeEach(async () => {
      const newInstrument = new Instrument({
        name: "Test",
      });
      instrument = await newInstrument.save();
      id = instrument._id;
    });

    it("should get instrument by id", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual(instrument.name);
    });

    it("should return 400 if wrong instrument id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if instrument was not fond", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /:id", () => {
    let id, newInstrument, accessToken;

    const exec = async () => {
      return await request(server)
        .put("/api/instruments/" + id)
        .send(newInstrument)
        .set("Authorization", `JWT ${accessToken}`);
    };

    beforeEach(async () => {
      newInstrument = {
        name: "New name",
      };
      accessToken = new User({ role: "admin" }).generateAccessToken();
      let instrument = new Instrument({ name: "Test" });
      instrument = await instrument.save();
      id = instrument._id;
    });

    it("should update instrument", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual("New name");
    });

    it("should return 400 if wrong instrument id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if empty body request", async () => {
      newInstrument = {};

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if instrument name is less than 4 characters long", async () => {
      newInstrument.name = "T";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /", () => {
    let id, accessToken;

    const exec = async () => {
      return await request(server)
        .delete("/api/instruments/" + id)
        .set("Authorization", `JWT ${accessToken}`);
    };

    beforeEach(async () => {
      accessToken = new User({ role: "admin" }).generateAccessToken();
      let instrument = {
        name: "Test",
      };
      instrument = new Instrument(instrument);
      instrument = await instrument.save();
      id = instrument._id;
    });

    it("should delete instrument", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.name).toEqual("Test");
    });

    it("should return 400 if wrong instrument id", async () => {
      id = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if instrument was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
