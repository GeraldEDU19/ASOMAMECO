const AttendeeService = require("../services/AttendeeService");

const AttendeeController = {
    validateAttendanceToken: async (req, res) => {
        try {
            console.log("Intenta validar")
            const { token } = req.params;
            const result = await AttendeeService.validateAttendanceToken(token);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    checkAttendanceToken: async (req, res) => {
        try {
            const { token } = req.params;
            const result = await AttendeeService.checkAttendanceToken(token);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = AttendeeController;
