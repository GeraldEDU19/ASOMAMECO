require("dotenv").config();
const mongoose = require("mongoose");

const EventService = require("../services/EventService");
const Event = require("../models/Event");

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

let session;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await Event.deleteMany({});
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

describe("Event Service Tests", () => {
  it("should create an event successfully", async () => {
    const eventData = {
      name: "Tech Conference",
      date: new Date("2025-05-20"),
      description: "A conference about tech trends",
      location: "New York"
    };

    const response = await EventService.createEvent(eventData, session);
    assertEqual("createEvent", eventData, response.success, true, "Event creation success");
    assertEqual("createEvent", eventData, response.status, "Creado", "Status should be 'Creado'");
    expect(response.data.event).toHaveProperty("_id");
  });

  it("should fail to create an event when name is missing", async () => {
    const eventData = {
      date: new Date("2025-05-20"),
      description: "No name provided",
      location: "New York"
    };

    const response = await EventService.createEvent(eventData, session);
    assertEqual("createEvent", eventData, response.success, false, "Event creation should fail without name");
    expect(response.message.toLowerCase()).toContain("evento no ha sido creado");
  });

  it("should update an event successfully", async () => {
    const eventData = {
      name: "Original Event",
      date: new Date("2025-06-15"),
      description: "Original description",
      location: "Los Angeles"
    };

    const createResp = await EventService.createEvent(eventData, session);
    assertEqual("createEvent", eventData, createResp.success, true, "Event creation for update");

    const updateData = { name: "Updated Event" };
    const updateResp = await EventService.updateEvent(createResp.data.event._id, updateData, session);
    assertEqual("updateEvent", updateData, updateResp.success, true, "Event update success");
    expect(updateResp.data.event.name).toBe(updateData.name);
  });

  it("should search for events", async () => {
    const e1 = { name: "Music Festival", date: new Date("2025-07-10"), description: "Music!", location: "Austin" };
    const e2 = { name: "Art Festival", date: new Date("2025-08-05"), description: "Art!", location: "Miami" };

    await EventService.createEvent(e1, session);
    await EventService.createEvent(e2, session);

    const query = { name: /Festival$/ };
    const searchResp = await EventService.searchEvents(query, session);
    assertEqual("searchEvents", query, searchResp.success, true, "Search events success");
    expect(searchResp.data.length).toBe(2);
  });

  it("should deactivate an event", async () => {
    const eventData = {
      name: "Event to Deactivate",
      date: new Date("2025-09-01"),
      description: "To be deactivated",
      location: "Chicago"
    };

    const createResp = await EventService.createEvent(eventData, session);
    assertEqual("createEvent", eventData, createResp.success, true, "Event creation for deactivation");

    const deactivateResp = await EventService.deactivateEvent(createResp.data.event._id, session);
    assertEqual("deactivateEvent", {}, deactivateResp.success, true, "Event deactivation success");

    const updatedEvent = await Event.findById(createResp.data.event._id).session(session).lean();
    expect(updatedEvent.active).toBe(false);
  });

  it("should register attendance to an event", async () => {
    const eventData = {
      name: "Attendance Event",
      date: new Date("2025-10-15"),
      description: "Testing attendance",
      location: "Seattle"
    };

    const createResp = await EventService.createEvent(eventData, session);
    const fakeUserId = new mongoose.Types.ObjectId();

    const attendanceResp = await EventService.registerAttendance(createResp.data.event._id, fakeUserId, session);
    assertEqual("registerAttendance", {}, attendanceResp.success, true, "Attendance registration success");

    const updatedEvent = await Event.findById(createResp.data.event._id).session(session).lean();
    expect(updatedEvent.attendees.map(id => id.toString())).toContain(fakeUserId.toString());
  });

  it("should not register attendance for non-existing event", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const fakeUserId = new mongoose.Types.ObjectId();

    const response = await EventService.registerAttendance(nonExistingId, fakeUserId, session);
    assertEqual("registerAttendance", {}, response.success, false, "Attendance should fail for non-existing event");
    expect(response.message.toLowerCase()).toContain("event not found");
  });

  it("should not update a non-existing event", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const updateData = { name: "Nonexistent" };

    const response = await EventService.updateEvent(nonExistingId, updateData, session);
    assertEqual("updateEvent", {}, response.success, false, "Non-existing event update failure");
    expect(response.message.toLowerCase()).toContain("evento no encontrado");
  });
});
