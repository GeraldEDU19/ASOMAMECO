const Event = require("../models/Event");
const mongoose = require("mongoose");

class EventService {
  // Create a new event
  static async createEvent(eventData, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = new Event(eventData);
      await event.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return { success: true, event };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Update event details
  static async updateEvent(eventId, updateData, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        updateData,
        { new: true, session: currentSession }
      );
      if (!event) return { success: false, message: "Event not found" };
      if (!session) await currentSession.commitTransaction();
      return { success: true, event };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Search for events based on a query
  static async searchEvents(query, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const events = await Event.find(query).session(currentSession);
      if (!session) await currentSession.commitTransaction();
      return { success: true, events };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Deactivate (cancel) an event
  static async deactivateEvent(eventId, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { active: false },
        { new: true, session: currentSession }
      );
      if (!event) return { success: false, message: "Event not found" };
      if (!session) await currentSession.commitTransaction();
      return { success: true, event };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Register a user's attendance to an event
  static async registerAttendance(eventId, userId, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findById(eventId).session(currentSession);
      if (!event) return { success: false, message: "Event not found" };
      // Avoid duplicate attendance
      if (!event.attendees.includes(userId)) {
        event.attendees.push(userId);
      }
      await event.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return { success: true, event };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }
}

module.exports = EventService;
