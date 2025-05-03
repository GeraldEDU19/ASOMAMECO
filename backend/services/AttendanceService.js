const Attendance = require("../models/Attendance");
const Event = require("../models/Event");
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse");
const jwt = require('jsonwebtoken');
const EmailService = require('../utils/sendEmail');

class AttendanceService {
    static async sendConfirmationEmail(attendanceIds = [], eventId, language = 'es') {
        let event = await Event.findById(eventId);
        for (const attendanceId of attendanceIds) {
            try {
                const attendance = await Attendance.findById(attendanceId.toString());

                if (!attendance.confirmed) {
                    const fullDate = new Date();
                    const payload = {
                        attendanceId: attendanceId,
                        date: fullDate.toISOString(),
                        eventId
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: '24h',
                    });

                    const attendanceLink = `${process.env.FE_URL}confirm-attendance/${token}`;
                    let affiliate = attendance.affiliate;

                    await EmailService.sendEventConfirmationEmail(
                        affiliate.email,
                        affiliate.fullName || 'Afiliado',
                        attendanceLink,
                        language
                    );
                }
            } catch (error) {
                console.log(error.message);
            }
        }
    }

    static async validateAttendanceToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { attendanceId } = decoded;

            const attendance = await Attendance.findById(attendanceId.toString());
            if (!attendance) {
                return BuildMethodResponse({
                    success: false,
                    status: "Fallido",
                    message: "Asistencia no encontrada"
                });
            }

            if (attendance.confirmed) {
                return BuildMethodResponse({
                    success: true,
                    status: "Confirmado",
                    message: "La asistencia ya había sido confirmada",
                    externalId: attendance.affiliate?.externalId,
                    fullName: attendance.affiliate?.fullName
                });
            }

            attendance.confirmed = true;
            await attendance.save();

            return BuildMethodResponse({
                success: true,
                status: "Confirmado",
                message: "Asistencia confirmada exitosamente",
                externalId: attendance.affiliate?.externalId,
                fullName: attendance.affiliate?.fullName
            });

        } catch (error) {
            return BuildMethodResponse({
                success: false,
                status: "Fallido",
                message: error.message
            });
        }
    }

    static async checkAttendanceToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { attendanceId } = decoded;

            const attendance = await Attendance.findById(attendanceId.toString());
            if (!attendance) {
                return BuildMethodResponse({
                    success: false,
                    status: "Fallido",
                    message: "Asistencia no encontrada"
                });
            }

            return BuildMethodResponse({
                success: true,
                status: "Confirmado",
                message: attendance.confirmed
                    ? "Asistencia ya confirmada"
                    : "Asistencia aún no confirmada",
                externalId: attendance.affiliate?.externalId,
                fullName: attendance.affiliate?.fullName,
                data: { confirmed: attendance.confirmed }
            });
        } catch (error) {
            return BuildMethodResponse({
                success: false,
                status: "Fallido",
                message: error.message
            });
        }
    }

    static async getUserByAttendanceId(attendanceId) {
        // Implementar la lógica para obtener el usuario por attendanceId
        // Esto es un placeholder, debes implementar la lógica real
        return {
            email: 'user@example.com',
            name: 'User Name',
            language: 'es'
        };
    }
}

module.exports = AttendanceService;
