// tests/Attendance.test.js

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const AttendanceService = require("../services/AttendanceService");
const Attendance = require("../models/Attendance");
const Event = require("../models/Event");
const Affiliate = require("../models/Affiliate");

// Mock del email sender
jest.mock("../utils/sendEmail", () =>
  jest.fn(() => Promise.resolve({ messageId: "test-message-id" }))
);

let session;
let affiliate;
let event;
let attendance;
let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await mongoose.connection.db.dropCollection('attendances').catch(() => {});
  await mongoose.connection.db.dropCollection('affiliates').catch(() => {});
  await mongoose.connection.db.dropCollection('events').catch(() => {});

  // Creamos los documentos SIN sesión antes del test
  affiliate = await Affiliate.create({
    externalId: "A001",
    firstName: "Test",
    firstLastName: "User",
    secondLastName: "Test",
    email: "testuser@example.com",
    telephoneNumber: "88889999",
  });

  event = await Event.create({
    name: "Test Event",
    date: new Date(),
    description: "Testing Event",
    location: "Nowhere",
  });

  attendance = await Attendance.create({
    event: event._id,
    affiliate: affiliate._id,
    confirmed: false,
    attended: false,
  });

  const payload = {
    attendanceId: attendance._id.toString(),
    date: new Date().toISOString(),
    eventId: event._id.toString(),
  };
  token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Ahora sí iniciamos la sesión
  session = await mongoose.startSession();
  session.startTransaction();
});

afterEach(async () => {
  await session.abortTransaction();
  session.endSession();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Attendance Service Tests", () => {
  it("should validate attendance token and confirm", async () => {
    const response = await AttendanceService.validateAttendanceToken(token);
    expect(response.success).toBe(true);
    expect(response.status).toBe("Confirmado");
  });

  it("should check attendance token after confirming", async () => {
    // <-- FIX IMPORTANTE --> Primero confirmamos
    await AttendanceService.validateAttendanceToken(token);

    // Ahora sí validamos el check
    const response = await AttendanceService.checkAttendanceToken(token);
    expect(response.success).toBe(true);
    expect(response.data.confirmed).toBe(true);
  });

  it("should fail validate attendance token with invalid token", async () => {
    const invalid = await AttendanceService.validateAttendanceToken("invalid.token.here");
    expect(invalid.success).toBe(false);
  });

  it("should fail check attendance token with invalid token", async () => {
    const invalid = await AttendanceService.checkAttendanceToken("invalid.token.here");
    expect(invalid.success).toBe(false);
  });

  it("should fail validate if attendance does not exist", async () => {
    const fakePayload = {
      attendanceId: new mongoose.Types.ObjectId().toString(),
      date: new Date().toISOString(),
      eventId: event._id.toString(),
    };
    const fakeToken = jwt.sign(fakePayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await AttendanceService.validateAttendanceToken(fakeToken);
    expect(response.success).toBe(false);
  });

  it("should fail check if attendance does not exist", async () => {
    const fakePayload = {
      attendanceId: new mongoose.Types.ObjectId().toString(),
      date: new Date().toISOString(),
      eventId: event._id.toString(),
    };
    const fakeToken = jwt.sign(fakePayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await AttendanceService.checkAttendanceToken(fakeToken);
    expect(response.success).toBe(false);
  });
});
