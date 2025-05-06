const AffiliateService = require("../services/AffiliateService");

const AffiliateController = {
  create: async (req, res) => {
    try {
      const affiliateData = req.body;
      const update = req.query.update == "true"
      const language = req.headers['accept-language'] || 'en'; // Extract language
      
      const result = await AffiliateService.createAffiliate(affiliateData, update);
      
      // Set status based on result and translate
      let statusCode = 500; // Default to internal server error
      if (result.success) {
          // CREATED or UPDATED (assuming service returns these statuses)
          statusCode = result.status === 'affiliate.created' ? 201 : 200;
      } else {
          switch (result.status) {
              case "CONFLICT":
              case "INVALID_DATA":
              case "NOT_FOUND": // For the update case where doc not found
                  statusCode = 400; 
                  break;
              case "ERROR":
              default:
                  statusCode = 500;
                  break;
          }
      }
      res.status(statusCode).json(global.TranslateResponse(result, language));

    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' 
      }, language));
    }
  },

  // NOTE: Re-adding getReport and bulkCreate as requested. They still need review/refactoring for translation and service alignment.
  
  getReport: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      // TODO: This service method seems incorrect (should be event-related?) and needs translation support
      const result = await AffiliateService.getAffiliateReport(affiliateId);
      const language = req.headers['accept-language'] || 'en'; // Added language extraction

      if (result.success) {
        res.status(200).json(global.TranslateResponse(result, language)); // Added translation
      } else {
        res.status(400).json(global.TranslateResponse(result, language)); // Added translation
      }
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' // Use generic error key
      }, language));
    }
  },
  bulkCreate: async (req, res) => {
    try {
      const affiliatesDataArray = req.body;
      const update = req.query.update == "true"
      const language = req.headers['accept-language'] || 'en'; // Added language extraction

      // Validate input
      if (!Array.isArray(affiliatesDataArray)) {
        return res
          .status(400)
          // TODO: Translate this hardcoded message
          .json(global.TranslateResponse({ success: false, status: 'INVALID_DATA', message: "Input must be an array of affiliates." }, language));
      }

      // TODO: AffiliateService.createManyAffiliates was noted as missing.
      // This will likely fail until that service method is implemented.
      // The response handling also needs standardization (BuildMethodResponse, translation keys).
      const results = await AffiliateService.createManyAffiliates(
        affiliatesDataArray,
        update,
      );

      // TODO: The response structure here needs to be standardized and translated.
      // Returning raw results might not be consistent.
      return res.status(200).json(global.TranslateResponse({ success: true, status: 'SUCCESS', data: results /* Assuming results is the data */ }, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      return res
        .status(500)
        .json(global.TranslateResponse({ // Translate generic error
          success: false, 
          status: 'ERROR',
          message: 'responses.general_error' // Use generic error key
        }, language));
    }
  },
  

  update: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const updateData = req.body;
      const language = req.headers['accept-language'] || 'en'; // Extract language
      
      const result = await AffiliateService.updateAffiliate(affiliateId, updateData);

      // Set status based on result and translate
      let statusCode = 500; // Default error
      if (result.success) {
          statusCode = 200; // OK for successful update
      } else {
          switch (result.status) {
              case "NOT_FOUND":
                  statusCode = 404; 
                  break;
              case "CONFLICT":
              case "INVALID_DATA":
                  statusCode = 400;
                  break;
              case "ERROR":
              default:
                  statusCode = 500;
                  break;
          }
      }
      res.status(statusCode).json(global.TranslateResponse(result, language));

    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' 
      }, language));
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query;
      const language = req.headers['accept-language'] || 'en'; // Extract language
      
      const result = await AffiliateService.searchAffiliates(query);
      
      // Translate and send (always 200 for search, even if no results)
      res.status(200).json(global.TranslateResponse(result, language));

    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' 
      }, language));
    }
  },

  deactivate: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const language = req.headers['accept-language'] || 'en'; // Extract language
      
      const result = await AffiliateService.deactivateAffiliate(affiliateId);

      // Set status based on result and translate
      let statusCode = 500; // Default error
      if (result.success) {
          statusCode = 200; // OK for successful deactivation
      } else {
          switch (result.status) {
              case "NOT_FOUND":
                  statusCode = 404;
                  break;
              case "ERROR":
              default:
                  statusCode = 500;
                  break;
          }
      }
      res.status(statusCode).json(global.TranslateResponse(result, language));

    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' 
      }, language));
    }
  },

  registerAttendance: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const { userId } = req.body;
      const language = req.headers['accept-language'] || 'en'; // Extract language
      
      const result = await AffiliateService.registerAttendance(affiliateId, userId);
      
      // Set status based on result and translate
      let statusCode = 500; // Default error
       if (result.success) {
          statusCode = 200; // OK for successful registration
      } else {
          switch (result.status) {
              case "NOT_FOUND":
                  statusCode = 404;
                  break;
              case "SCHEMA_MISMATCH":
                  statusCode = 400; // Bad request if schema doesn't support
                  break;
              case "ERROR":
              default:
                  statusCode = 500;
                  break;
          }
      }
      res.status(statusCode).json(global.TranslateResponse(result, language));

    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en'; // Extract language for error
      res.status(500).json(global.TranslateResponse({ // Translate generic error
        success: false, 
        status: 'ERROR',
        message: 'responses.general_error' 
      }, language));
    }
  }
};

module.exports = AffiliateController;
