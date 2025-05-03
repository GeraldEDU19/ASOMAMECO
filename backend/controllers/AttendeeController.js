const AttendanceService = require("../services/AttendanceService");

const AttendanceController = {
    sendConfirmationEmail: async (req, res) => {
        try {
            const { attendanceIds, eventId } = req.body;
            const acceptLanguage = req.headers['accept-language'] || 'en';
            const language = acceptLanguage.split('-')[0].toLowerCase();
            
            await AttendanceService.sendConfirmationEmail(attendanceIds, eventId, language);
            res.status(200).json({ success: true, message: "Emails sent successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    },

    validateAttendanceToken: async (req, res) => {
        try {
            const { token } = req.params;
            const result = await AttendanceService.validateAttendanceToken(token);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    },

    checkAttendanceToken: async (req, res) => {
        try {
            const { token } = req.params;
            const result = await AttendanceService.checkAttendanceToken(token);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = AttendanceController;
