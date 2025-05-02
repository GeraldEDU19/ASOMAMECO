const Event = require("../models/Event");
const Attendee = require("../models/Attendee")
const AttendeeService = require("./AttendeeService")
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse")
const AffiliateService = require("./AffiliateService")
const mongoose = require("mongoose");

class EventService {
  // Create a new event
  static async createEvent(eventData, session = null) {
    const ownSession = !session;
    const currentSession = session ?? await mongoose.startSession();
    if (ownSession) currentSession.startTransaction();

    // Extract attendees from payload
    const incoming = Array.isArray(eventData.attendees)
      ? eventData.attendees
      : [];

    try {
      // 1) Create event without attendees to get _id
      const { attendees, ...rest } = eventData;
      let event = new Event(rest);
      await event.save({ session: currentSession });

      // 2) For each entry in incoming, create/update affiliate and attendee
      const attendeeIds = [];
      const attendeesResponse = [];

      for (const a of incoming) {
        // a. Create/update affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          eventData.update,
          currentSession
        );
        attendeesResponse.push(affResp);

        if (!affResp.success) {
          // If failed, we can abort or continue, depending on your logic
          continue;
        }

        // b. Upsert Attendee
        const attDoc = await Attendee.findOneAndUpdate(
          { event: event._id, affiliate: affResp.data._id },
          {
            $set: {
              confirmed: a.confirmed,
              attended: a.attended
            }
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
            session: currentSession
          }
        );
        attendeeIds.push(attDoc._id);
      }

      // 3) Save list of Attendee IDs in the event
      event.attendees = attendeeIds;
      await event.save({ session: currentSession });

      AttendeeService.sendConfirmationEmail(attendeeIds, event._id.toString())

      if (ownSession) await currentSession.commitTransaction();
      return BuildMethodResponse({
        success: true,
        status: "CREATED",
        message: "event.created",
        data: { event, attendeesResponse }
      });

    } catch (err) {
      console.error(err);
      if (ownSession) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "FAILED",
        message: "event.creation_failed",
        data: { error: err.message }
      });
    } finally {
      if (ownSession) currentSession.endSession();
    }
  }

  // Update event details
  static async updateEvent(eventId, updateData, session = null) {
    const ownSession = !session;
    const currentSession = session ?? await mongoose.startSession();
    if (ownSession) currentSession.startTransaction();

    // Extract attendees from payload (if any)
    const incoming = Array.isArray(updateData.attendees)
      ? updateData.attendees
      : [];

    try {
      // 1) Update basic fields (without touching attendees yet)
      const { attendees, ...rest } = updateData;
      let event = await Event.findByIdAndUpdate(
        eventId,
        rest,
        { new: true, session: currentSession }
      );
      if (!event) {
        if (ownSession) await currentSession.abortTransaction();
        return BuildMethodResponse({
          success: false,
          status: "NOT_FOUND",
          message: "event.not_found"
        });
      }

      // 2) Process each incoming attendee
      const attendeeIds = [];
      const attendeesResponse = [];

      for (const a of incoming) {
        // a) Create/update affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          true,                  // Force update if already exists
          currentSession
        );
        attendeesResponse.push(affResp);

        if (!affResp.success) {
          // If fails, we let it pass (or you could abort if preferred)
          continue;
        }

        // b) Upsert in Attendee
        const attDoc = await Attendee.findOneAndUpdate(
          { event: event._id, affiliate: affResp.data._id },
          {
            $set: {
              confirmed: a.confirmed,
              attended:  a.attended
            }
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
            session: currentSession
          }
        );
        attendeeIds.push(attDoc._id);
      }

      // 3) Overwrite event.attendees and save
      event.attendees = attendeeIds;
      await event.save({ session: currentSession });

      if (ownSession) await currentSession.commitTransaction();

      return BuildMethodResponse({
        success: true,
        status: "UPDATED",
        message: "event.updated",
        data: { event, attendeesResponse }
      });

    } catch (err) {
      console.error(err);
      if (ownSession) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "FAILED",
        message: "event.update_failed",
        data: { error: err.message }
      });
    } finally {
      if (ownSession) currentSession.endSession();
    }
  }

  // Search for events based on a query
  static async searchEvents(query, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const events = await Event.find(query).session(currentSession);
      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: "SUCCESS",
        message: "event.search_success",
        data: events
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      console.log(error);
      return global.BuildMethodResponse({
        success: false,
        status: "FAILED",
        message: "event.search_failed",
        data: { error: error.message }
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Deactivate an event
  static async deactivateEvent(eventId, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { active: false },
        { new: true, session: currentSession }
      );

      if (!event) {
        if (!session) await currentSession.abortTransaction();
        return BuildMethodResponse({
          success: false,
          status: "NOT_FOUND",
          message: "event.not_found"
        });
      }

      if (!session) await currentSession.commitTransaction();
      return BuildMethodResponse({
        success: true,
        status: "UPDATED",
        message: "event.deactivated",
        data: { event }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "FAILED",
        message: "event.deactivation_failed",
        data: { error: error.message }
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Get event report
  static async getEventReport(eventId, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findById(eventId).session(currentSession);
      if (!event) {
        if (!session) await currentSession.abortTransaction();
        return BuildMethodResponse({
          success: false,
          status: "NOT_FOUND",
          message: "event.not_found"
        });
      }

      const attendees = await Attendee.find({ event: eventId }).session(currentSession);
      const report = {
        totalAttendees: attendees.length,
        confirmed: attendees.filter(a => a.confirmed).length,
        notConfirmed: attendees.filter(a => !a.confirmed).length,
        attended: attendees.filter(a => a.attended).length,
        confirmedButDidNotAttend: attendees.filter(a => a.confirmed && !a.attended).length
      };

      if (!session) await currentSession.commitTransaction();
      return BuildMethodResponse({
        success: true,
        status: "SUCCESS",
        message: "event.report_generated",
        data: report
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "FAILED",
        message: "event.report_failed",
        data: { error: error.message }
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }
}

module.exports = EventService;
