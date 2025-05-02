// utils/sendEmail.js

const nodemailer = require('nodemailer');
const EmailBuilder = require('./emailBuilder');

class EmailService {
    /**
     * Sends an event confirmation email
     * @param {string} to - Recipient's email address
     * @param {string} userName - Recipient's name
     * @param {string} confirmationLink - URL to confirm attendance
     * @param {string} language - Email language (default: 'en')
     * @returns {Promise<void>}
     */
    static async sendEventConfirmationEmail(to, userName, confirmationLink, language = 'en') {
        const html = EmailBuilder.buildEmail('eventConfirmation', {
            userName,
            confirmationLink
        }, language);

        await this.sendEmail({
            to,
            subject: 'Invitation to event',
            html
        });
    }

    /**
     * Sends a password recovery email
     * @param {string} to - Recipient's email address
     * @param {string} userName - Recipient's name
     * @param {string} recoveryLink - URL to recover password
     * @param {string} language - Email language (default: 'en')
     * @returns {Promise<void>}
     */
    static async sendPasswordRecoveryEmail(to, userName, recoveryLink, language = 'en') {
        const html = EmailBuilder.buildEmail('passwordRecovery', {
            userName,
            recoveryLink
        }, language);

        await this.sendEmail({
            to,
            subject: 'Password Recovery',
            html
        });
    }

    /**
     * Sends an email using the configured SMTP settings
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient's email address
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML content of the email
     * @returns {Promise<void>}
     */
    static async sendEmail({ to, subject, html }) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html
        });
    }
}

module.exports = EmailService;
