const { BuildMethodResponse, ResponseStatus } = require('./reponses/BuildMethodResponse');
const TranslateResponse = require('./reponses/TranslateResponse');

// Make these available globally
global.BuildMethodResponse = BuildMethodResponse;
global.ResponseStatus = ResponseStatus;
global.TranslateResponse = TranslateResponse;

// Also export them for direct imports if needed
module.exports = {
  BuildMethodResponse,
  ResponseStatus,
  TranslateResponse
}; 