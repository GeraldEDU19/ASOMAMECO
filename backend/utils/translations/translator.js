const enTranslations = require('./languages/en.json');
const esTranslations = require('./languages/es.json');

class Translator {
  static #translations = {
    en: enTranslations,
    es: esTranslations
  };

  static #defaultLanguage = 'en';

  /**
   * Get a translated string based on the provided key and language
   * @param {string} key - The translation key (e.g., 'common.success')
   * @param {string} [language='en'] - The language code (e.g., 'en', 'es')
   * @returns {string} The translated string or the key if translation not found
   */
  static translate(key, language = this.#defaultLanguage) {
    const lang = this.#translations[language] || this.#translations[this.#defaultLanguage];
    
    // Split the key by dots to navigate through the nested structure
    const keys = key.split('.');
    let result = lang;

    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = result[k];
      } else {
        return key; // Return the original key if translation not found
      }
    }

    return result || key;
  }

  /**
   * Set the default language for translations
   * @param {string} language - The language code (e.g., 'en', 'es')
   */
  static setDefaultLanguage(language) {
    if (this.#translations[language]) {
      this.#defaultLanguage = language;
    }
  }

  /**
   * Get the current default language
   * @returns {string} The current default language code
   */
  static getDefaultLanguage() {
    return this.#defaultLanguage;
  }
}

module.exports = Translator; 