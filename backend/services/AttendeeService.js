const Attendee = require("../models/Attendee");
const Event = require("../models/Event");
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse");
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

class AttendeeService {
    static async sendConfirmationEmail(attendanceIds = [], eventId) {
        let event = await Event.findById(eventId);
        for (const attendanceId of attendanceIds) {
            try {
                const attendance = await Attendee.findById(attendanceId.toString());

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

                    await sendEmail(
                        affiliate.email,
                        'Asistencia a evento',
                        `
                            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                            <h2 style="color: #4CAF50;">Invitacion ${event.name} el ${event.date}</h2>
                            <p>Hola ${affiliate.fullName || 'Afiliado'},</p>
                            <p>Se ha creado un nuevo evento al que has sido invitado, pedimos por favor confirmar asistencia:</p>
                            <a 
                                href="${attendanceLink}" 
                                style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;"
                            >
                                Confirmar asistencia
                            </a>
                            <p>En caso de que no quiera asistir al evento, simplemente ignore el email. Tiene 24 horas para confirmar.</p>
                            <p>Gracias,</p>
                            <p><strong>El equipo de ASOMAMECO</strong></p>
                            </div>
                        `
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

            const attendance = await Attendee.findById(attendanceId.toString());
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

            const attendance = await Attendee.findById(attendanceId.toString());
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
}

module.exports = AttendeeService;
