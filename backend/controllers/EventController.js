const EventService = require("../services/EventService");

const EventController = {
  create: async (req, res) => {
    try {
     const eventData = req.body;
      const result = await EventService.createEvent(eventData);
      console.log(result)
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const eventId = req.params.id;
      const updateData = req.body;
      const result = await EventService.updateEvent(eventId, updateData);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query;
      const result = await EventService.searchEvents(query);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deactivate: async (req, res) => {
    try {
      const eventId = req.params.id;
      const result = await EventService.deactivateEvent(eventId);
      if (result.success) {
        res.status(200).json(result.event);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getReport: async (req, res) => {
    try {
      const eventId = req.params.id;
      const result = await EventService.getEventReport(eventId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  registerAttendance: async (req, res) => {
    try {
      const eventId = req.params.id;
      const { userId } = req.body;
      const result = await EventService.registerAttendance(eventId, userId);
      if (result.success) {
        res.status(200).json(result.event);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = EventController;
