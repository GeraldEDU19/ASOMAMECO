const EventService = require("../services/EventService");

const EventController = {
  // Create a new event
  create: async (req, res) => {
    try {
      const eventData = req.body;
      const result = await EventService.createEvent(eventData);
      const language = req.headers['accept-language'] || 'en';
      
      if (result.success) {
        res.status(201).json(global.TranslateResponse(result, language));
      } else {
        res.status(400).json(global.TranslateResponse(result, language));
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  // Update an existing event
  update: async (req, res) => {
    try {
      const eventId = req.params.id;
      const updateData = req.body;
      const result = await EventService.updateEvent(eventId, updateData);
      const language = req.headers['accept-language'] || 'en';
      
      if (result.success) {
        res.status(200).json(global.TranslateResponse(result, language));
      } else {
        res.status(404).json(global.TranslateResponse(result, language));
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  // Search for events
  search: async (req, res) => {
    try {
      const query = req.query;
      const result = await EventService.searchEvents(query);
      const language = req.headers['accept-language'] || 'en';
      
      if (result.success) {
        res.status(200).json(global.TranslateResponse(result, language));
      } else {
        res.status(400).json(global.TranslateResponse(result, language));
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  // Deactivate an event
  deactivate: async (req, res) => {
    try {
      const eventId = req.params.id;
      const result = await EventService.deactivateEvent(eventId);
      const language = req.headers['accept-language'] || 'en';
      
      if (result.success) {
        res.status(200).json(global.TranslateResponse(result, language));
      } else {
        res.status(404).json(global.TranslateResponse(result, language));
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  // Get event report
  getReport: async (req, res) => {
    try {
      const eventId = req.params.id;
      const result = await EventService.getEventReport(eventId);
      const language = req.headers['accept-language'] || 'en';
      
      if (result.success) {
        res.status(200).json(global.TranslateResponse(result, language));
      } else {
        res.status(400).json(global.TranslateResponse(result, language));
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  }
};

module.exports = EventController;
