const fs = require('fs');
const path = require('path');
const Translator = require('./translations/translator');

const TEMPLATES_DIR = path.join(__dirname, 'emailTemplates');

class EmailBuilder {
    /**
     * Builds the HTML content of an email using a template and variables
     * @param {string} templateName - Name of the HTML template
     * @param {string} language - Language for translations
     * @param {Object} variables - Variables to replace in the template
     * @returns {string} Email HTML content
     */
    static async buildEmail(templateName, language, variables) {
        try {
            const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
            let html = fs.readFileSync(templatePath, 'utf8');

            // Get translations for the email type
            const translations = Translator.translate(`email.${templateName}`, language);

            const allVariables = { ...translations, ...variables };

            for (const [key, value] of Object.entries(allVariables)) {
                if (value) {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    html = html.replace(regex, value);
                }
            }

            return html;
        } catch (error) {
            console.error('Error building email:', error);
            throw error;
        }
    }

    /**
     * Builds an event attendance confirmation email
     * @param {string} language - Email language
     * @param {string} userName - User's name
     * @param {string} eventName - Event name
     * @param {string} eventDate - Event date
     * @param {string} confirmationLink - URL to confirm attendance
     * @returns {string} Email HTML content
     */
    static async buildEventConfirmationEmail(language, userName, eventName, eventDate, confirmationLink) {
        return this.buildEmail('eventConfirmation', language, {
            userName,
            eventName,
            eventDate,
            actionUrl: confirmationLink
        });
    }

    /**
     * Builds a password recovery email
     * @param {string} language - Email language
     * @param {string} userName - User's name
     * @param {string} recoveryLink - URL to recover password
     * @returns {string} Email HTML content
     */
    static async buildPasswordRecoveryEmail(language, userName, recoveryLink) {
        return this.buildEmail('passwordRecovery', language, {
            userName,
            actionUrl: recoveryLink
        });
    }
}

module.exports = EmailBuilder; 