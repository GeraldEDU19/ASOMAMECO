// tests/AffiliateService.test.js

require("dotenv").config();
const mongoose = require("mongoose");
const AffiliateService = require("../services/AffiliateService");
const Affiliate = require("../models/Affiliate");

function assertEqual(funcName, data, received, expected, message) {
  if (received !== expected) {
    console.error(`Function: ${funcName}`);
    console.error(`Data: ${JSON.stringify(data, null, 2)}`);
    console.error(message);
    console.error("Expected:", expected);
    console.error("Received:", received);
  } else {
    console.log(`${funcName} – ${message}: Success`);
  }
  expect(received).toBe(expected);
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await Affiliate.deleteMany({});
});

afterAll(async () => {
  await Affiliate.deleteMany({});
  await mongoose.connection.close();
});

describe("AffiliateService.createAffiliate", () => {
  const baseData = {
    externalId: "AFF123",
    firstName: "Juan",
    secondName: "Carlos",
    firstLastName: "Pérez",
    secondLastName: "Gómez",
    email: "juan.perez@example.com",
    telephoneNumber: "88881234",
  };

  it("should create an affiliate successfully", async () => {
    const response = await AffiliateService.createAffiliate(baseData, false);
    assertEqual("createAffiliate", baseData, response.success, true, "Create affiliate success");
    assertEqual("createAffiliate", baseData, response.status, "Creado", "Status should be 'Creado'");
    const expectedFullName = `${baseData.firstName} ${baseData.secondName} ${baseData.firstLastName} ${baseData.secondLastName}`;
    assertEqual("createAffiliate", baseData, response.fullName, expectedFullName, "fullName matches");
  });

  it("should not allow duplicate externalId on create", async () => {
    await AffiliateService.createAffiliate(baseData, false);
    const dupData = { ...baseData, email: "another@example.com" };
    const response = await AffiliateService.createAffiliate(dupData, false);
    assertEqual("createAffiliate", dupData, response.success, false, "Duplicate externalId registration");
    expect(response.message.toLowerCase()).toContain("id externo");
  });

  it("should update existing affiliate when update=true", async () => {
    await AffiliateService.createAffiliate(baseData, false);
    const updated = { ...baseData, firstLastName: "Rodríguez" };
    const response = await AffiliateService.createAffiliate(updated, true);
    assertEqual("createAffiliate", updated, response.success, true, "Update affiliate success");
    assertEqual("createAffiliate", updated, response.status, "Actualizado", "Status should be 'Actualizado'");

    const saved = await Affiliate.findOne({ externalId: baseData.externalId });
    assertEqual("createAffiliate", updated, saved.firstLastName, "Rodríguez", "Last name persisted");
  });

  it("should fail creation when required fields are missing", async () => {
    const emptyData = {};
    const response = await AffiliateService.createAffiliate(emptyData, false);
    assertEqual("createAffiliate", emptyData, response.success, false, "Creation should fail without required fields");
    expect(response.message.toLowerCase()).toContain("campos inválidos");
  });
});

describe("AffiliateService.searchAffiliates", () => {
  it("should search affiliates successfully", async () => {
    const data = {
      externalId: "AFF321",
      firstName: "Luis",
      secondName: "Alonso",
      firstLastName: "Vargas",
      secondLastName: "Soto",
      email: "luis.vargas@example.com",
      telephoneNumber: "88884567",
    };
    await AffiliateService.createAffiliate(data, false);
    const response = await AffiliateService.searchAffiliates({ externalId: "AFF321" });
    assertEqual("searchAffiliates", data, response.success, true, "Search affiliates success");
    expect(Array.isArray(response.data)).toBe(true);
    assertEqual("searchAffiliates", data, response.data.length, 1, "One affiliate found");
  });
});
