require("dotenv").config();
const mongoose = require("mongoose");
const EventService = require("../services/EventService");

// Helper function to compare values and log expected vs received on mismatch
function assertEqual(received, expected, message) {
  if (received !== expected) {
    console.error(`${message} - Expected: ${expected}, Received: ${received}`);
  }
  expect(received).toBe(expected);
}

let session;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  // Create a new session and start a transaction for each test
  session = await mongoose.startSession();
  session.startTransaction();
});

afterEach(async () => {
  // Rollback the transaction to revert any changes done during the test
  await session.abortTransaction();
  session.endSession();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Event Service Tests", () => {
  it("Should create an event successfully", async () => {
    const eventData = {
      name: "Tech Conference",
      date: new Date("2025-05-20"),
      description: "A conference about new tech trends",
      location: "New York"
    };
    const response = await EventService.createEvent(eventData, session);
    assertEqual(response.success, true, "Event creation success");
    expect(response.event).toHaveProperty("_id");
    assertEqual(response.event.name, "Tech Conference", "Event name");
  });

  it("Should fail to create an event when name is missing", async () => {
    const eventData = {
      date: new Date("2025-05-20"),
      description: "No name provided",
      location: "New York"
    };
    const response = await EventService.createEvent(eventData, session);
    assertEqual(response.success, false, "Event creation should fail without name");
  });

  it("Should update an event successfully", async () => {
    const eventData = {
      name: "Original Event",
      date: new Date("2025-06-15"),
      description: "Original description",
      location: "Los Angeles"
    };
    const createResponse = await EventService.createEvent(eventData, session);
    assertEqual(createResponse.success, true, "Event creation for update");
    const event = createResponse.event;
    const updateResponse = await EventService.updateEvent(event._id, { name: "Updated Event" }, session);
    assertEqual(updateResponse.success, true, "Event update success");
    assertEqual(updateResponse.event.name, "Updated Event", "Updated event name");
  });

  it("Should search for events", async () => {
    // Create two events with a common word in the name
    await EventService.createEvent(
      { name: "Music Festival", date: new Date("2025-07-10"), description: "Great music", location: "Austin" },
      session
    );
    await EventService.createEvent(
      { name: "Art Festival", date: new Date("2025-08-05"), description: "Art exhibition", location: "Miami" },
      session
    );
    const searchResponse = await EventService.searchEvents({ name: /Festival$/ }, session);
    assertEqual(searchResponse.success, true, "Search events success");
    // Expect 2 events that end with "Festival"
    assertEqual(searchResponse.events.length, 2, "Search results length for events");
  });

  it("Should deactivate an event", async () => {
    const eventData = {
      name: "Event to Deactivate",
      date: new Date("2025-09-01"),
      description: "This event will be deactivated",
      location: "Chicago"
    };
    const createResponse = await EventService.createEvent(eventData, session);
    assertEqual(createResponse.success, true, "Event creation for deactivation");
    const event = createResponse.event;
    const deactivateResponse = await EventService.deactivateEvent(event._id, session);
    assertEqual(deactivateResponse.success, true, "Event deactivation success");
    assertEqual(deactivateResponse.event.active, false, "Event active status after deactivation");
  });

  it("Should register attendance to an event", async () => {
    const eventData = {
      name: "Attendance Event",
      date: new Date("2025-10-15"),
      description: "Event for testing attendance",
      location: "Seattle"
    };
    const createResponse = await EventService.createEvent(eventData, session);
    assertEqual(createResponse.success, true, "Event creation for attendance");
    const event = createResponse.event;
    // Simulate a user id (in a real case, this would be an ObjectId from a User)
    const fakeUserId = new mongoose.Types.ObjectId();
    const attendanceResponse = await EventService.registerAttendance(event._id, fakeUserId, session);
    assertEqual(attendanceResponse.success, true, "Attendance registration success");
    // Verify that the attendee was added
    const updatedEvent = attendanceResponse.event;
    expect(updatedEvent.attendees).toContainEqual(fakeUserId);
  });

  it("Should not register attendance for non-existing event", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const fakeUserId = new mongoose.Types.ObjectId();
    const response = await EventService.registerAttendance(nonExistingId, fakeUserId, session);
    assertEqual(response.success, false, "Attendance registration should fail for non-existing event");
    assertEqual(response.message, "Event not found", "Proper error message for non-existing event attendance");
  });

  it("Should not update a non-existing event", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const updateResponse = await EventService.updateEvent(nonExistingId, { name: "Doesn't exist" }, session);
    assertEqual(updateResponse.success, false, "Non-existing event update failure");
    assertEqual(updateResponse.message, "Event not found", "Non-existing event update message");
  });
});
