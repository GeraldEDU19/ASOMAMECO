const Event = require("../models/Event");
const Attendance = require("../models/Attendance")
const AttendanceService = require("./AttendanceService")
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse")
const AffiliateService = require("./AffiliateService")
const mongoose = require("mongoose");

class EventService {
  // Create a new event
  static async createEvent(eventData, session = null) {
    const ownSession = !session;
    const currentSession = session ?? await mongoose.startSession();
    if (ownSession) currentSession.startTransaction();

    // Extract attendances from payload
    const incoming = Array.isArray(eventData.attendances)
      ? eventData.attendances
      : [];

    try {
      // 1) Create event without attendances to get _id
      const { attendances, ...rest } = eventData;
      let event = new Event(rest);
      await event.save({ session: currentSession });

      // 2) For each entry in incoming, create/update affiliate and attendance
      const attendanceIds = [];
      const attendancesResponse = [];

      for (const a of incoming) {
        // a. Create/update affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          eventData.update,
          currentSession
        );
        attendancesResponse.push(affResp);

        if (!affResp.success) {
          // If failed, we can abort or continue, depending on your logic
          continue;
        }

        // b. Upsert Attendance
        const attDoc = await Attendance.findOneAndUpdate(
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
        attendanceIds.push(attDoc._id);
      }

      // 3) Save list of Attendance IDs in the event
      event.attendances = attendanceIds;
      await event.save({ session: currentSession });

      AttendanceService.sendConfirmationEmail(attendanceIds, event._id.toString())

      if (ownSession) await currentSession.commitTransaction();
      return BuildMethodResponse({
        success: true,
        status: "CREATED",
        message: "event.created",
        data: { event, attendancesResponse }
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

    // Extract attendances from payload (if any)
    const incoming = Array.isArray(updateData.attendances)
      ? updateData.attendances
      : [];

    try {
      // 1) Update basic fields (without touching attendances yet)
      const { attendances, ...rest } = updateData;
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

      // 2) Process each incoming attendance
      const attendanceIds = [];
      const attendancesResponse = [];

      for (const a of incoming) {
        // a) Create/update affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          true,                  // Force update if already exists
          currentSession
        );
        attendancesResponse.push(affResp);

        if (!affResp.success) {
          // If fails, we let it pass (or you could abort if preferred)
          continue;
        }

        // b) Upsert in Attendance
        const attDoc = await Attendance.findOneAndUpdate(
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
        attendanceIds.push(attDoc._id);
      }

      // 3) Overwrite event.attendances and save
      event.attendances = attendanceIds;
      await event.save({ session: currentSession });

      if (ownSession) await currentSession.commitTransaction();

      return BuildMethodResponse({
        success: true,
        status: "UPDATED",
        message: "event.updated",
        data: { event, attendancesResponse }
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
    console.log(eventId)
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const event = await Event.findById(eventId).session(currentSession);
      if (!event) {
        if (!session) await currentSession.abortTransaction();
        return global.BuildMethodResponse({
          success: false,
          status: "NOT_FOUND",
          message: "event.not_found"
        });
      }

      const attendances = await Attendance.find({ event: eventId }).session(currentSession);
      const report = {
        totalAttendances: attendances.length,
        confirmed: attendances.filter(a => a.confirmed).length,
        notConfirmed: attendances.filter(a => !a.confirmed).length,
        attended: attendances.filter(a => a.attended).length,
        confirmedButDidNotAttend: attendances.filter(a => a.confirmed && !a.attended).length
      };

      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: "SUCCESS",
        message: "event.report_generated",
        data: report
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
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
