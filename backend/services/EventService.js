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

    // extraemos los asistentes del payload
    const incoming = Array.isArray(eventData.attendees)
      ? eventData.attendees
      : [];

    try {
      // 1) Crear evento sin asistentes para obtener _id
      const { attendees, ...rest } = eventData;
      let event = new Event(rest);
      await event.save({ session: currentSession });

      // 2) Por cada entrada en incoming, crear/actualizar affiliate y attendee
      const attendeeIds = [];
      const attendeesResponse = [];

      for (const a of incoming) {
        // a. crear/actualizar affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          eventData.update,
          currentSession
        );
        attendeesResponse.push(affResp);

        if (!affResp.success) {
          // si falló, podemos abortar o seguir, según tu lógica
          continue;
        }

        // b. upsert Attendee
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

      // 3) Guardar lista de Attendee IDs en el evento
      event.attendees = attendeeIds;
      await event.save({ session: currentSession });

      AttendeeService.sendConfirmationEmail(attendeeIds, event._id.toString())

      if (ownSession) await currentSession.commitTransaction();
      return BuildMethodResponse({
        success: true,
        status: "Creado",
        message: "El evento ha sido creado",
        data: { event, attendeesResponse }
      });

    } catch (err) {
      console.error(err);
      if (ownSession) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "Fallido",
        message: "El evento no ha sido creado",
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

    // extraemos los asistentes del payload (si vienen)
    const incoming = Array.isArray(updateData.attendees)
      ? updateData.attendees
      : [];

    try {
      // 1) Actualizar campos básicos (sin tocar aún attendees)
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
          status: "Fallido",
          message: "Evento no encontrado"
        });
      }

      // 2) Procesar cada attendee entrante
      const attendeeIds = [];
      const attendeesResponse = [];

      for (const a of incoming) {
        // a) crear/actualizar affiliate
        const affResp = await AffiliateService.createAffiliate(
          a.affiliate,
          true,                  // forzar update si ya existe
          currentSession
        );
        attendeesResponse.push(affResp);

        if (!affResp.success) {
          // si falla, dejamos pasar (o podrías abortar si prefieres)
          continue;
        }

        // b) upsert en Attendee
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

      // 3) Sobrescribir event.attendees y guardar
      event.attendees = attendeeIds;
      await event.save({ session: currentSession });

      if (ownSession) await currentSession.commitTransaction();


      


      return BuildMethodResponse({
        success: true,
        status: "Actualizado",
        message: "El evento ha sido actualizado",
        data: { event, attendeesResponse }
      });

    } catch (err) {
      console.error(err);
      if (ownSession) await currentSession.abortTransaction();
      return BuildMethodResponse({
        success: false,
        status: "Fallido",
        message: "Error al actualizar el evento",
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
      return BuildMethodResponse({success: true, status: "Correcto", data: events, message: "Los eventos han sido buscados"});
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
