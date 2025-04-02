// utils/sendEmail.js

const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
  // Configuración del transporter para Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu correo de Gmail
      pass: process.env.GMAIL_PASS, // Tu contraseña o app password
    },
  });

  // Opciones del correo
  const mailOptions = {
    from: process.env.GMAIL_USER, // Remitente
    to,                          // Destinatario
    subject,                     // Asunto
    text,                        // Contenido del mensaje (puedes usar html en lugar de text si lo prefieres)
  };

  // Enviar el correos
  const info = await transporter.sendMail(mailOptions);
  console.log("Correo enviado: %s", info.messageId);
  return info;
}

module.exports = sendEmail;
