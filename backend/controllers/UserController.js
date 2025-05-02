const UserService = require("../services/UserService");

const UserController = {
  register: async (req, res) => {
    try {
      const userData = req.body;
      const response = await UserService.register(userData);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const response = await UserService.login(email, password);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  validateToken: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const acceptLanguage = req.headers['accept-language'] || 'en';
      const language = acceptLanguage.split('-')[0].toLowerCase();
      
      if (!authHeader) {
        return res.status(401).json(global.TranslateResponse({
          success: false,
          status: 'INVALID_DATA',
          message: "user.token_missing"
        }, language));
      }

      const token = authHeader;
      const result = await UserService.validateToken(token);
      const translatedResponse = global.TranslateResponse(result, language);

      if (translatedResponse.success) {
        return res.status(200).json(translatedResponse);
      } else {
        return res.status(401).json(translatedResponse);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }));
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const response = await UserService.update(userId, userData);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  changePassword: async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      const response = await UserService.changePassword(userId, newPassword);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  deactivate: async (req, res) => {
    try {
      const userId = req.params.id;
      const response = await UserService.deactivate(userId);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query;
      const acceptLanguage = req.headers['accept-language'] || 'en';
      const language = acceptLanguage.split('-')[0].toLowerCase();
      
      const result = await UserService.search(query);
      const translatedResponse = global.TranslateResponse(result, language);
      
      if (translatedResponse.success) {
        res.status(200).json(translatedResponse);
      } else {
        res.status(400).json(translatedResponse);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }));
    }
  },

  requestPasswordRecovery: async (req, res) => {
    try {
      const { email } = req.body;
      const acceptLanguage = req.headers['accept-language'] || 'en';
      const language = acceptLanguage.split('-')[0].toLowerCase();
      
      const response = await UserService.requestPasswordRecovery(email, language);
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const response = await UserService.resetPassword(token, newPassword);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  },

  verifyToken: async (req, res) => {
    try {
      const { token } = req.body;
      const response = await UserService.verifyToken(token);
      const language = req.headers['accept-language'] || 'en';
      return res.status(200).json(global.TranslateResponse(response, language));
    } catch (error) {
      console.log(error);
      const language = req.headers['accept-language'] || 'en';
      return res.status(500).json(global.TranslateResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      }, language));
    }
  }
};

module.exports = UserController;
