const Translator = require('../translations/translator');
const { ResponseStatus } = require('./BuildMethodResponse');

/**
 * Translates a response object to the specified language
 * 
 * @param {Object} response - The response object to translate
 * @param {string} [language='en'] - The target language
 * @returns {Object} The translated response object
 */
function TranslateResponse(response, language = 'en') {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response object');
  }

  // Ensure language is valid, default to English
  const validLanguage = ['es', 'en'].includes(language) ? language : 'en';

  // Keep status in uppercase and English
  const status = response.status.toUpperCase();

  // If there's a custom message key, use it directly
  let translatedMessage;
  if (response.message && response.message.includes('.')) {
    translatedMessage = Translator.translate(
      `responses.${response.message}`,
      validLanguage
    );
  } else {
    // If no custom message or it's not a key, use the default message for the status
    translatedMessage = Translator.translate(
      `responses.${response.status.toLowerCase()}`,
      validLanguage
    );
  }

  return {
    ...response,
    status,
    message: translatedMessage
  };
}

module.exports = TranslateResponse; 