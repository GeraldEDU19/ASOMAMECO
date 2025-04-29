const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse")

class UserService {
  static async register(userData, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = new User(userData);
      await user.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async login(email, password, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {

      const user = await User.findOne({ email, active: true }).session(
        currentSession
      );
      
      if (!user) return { success: false, message: 'Invalid credentials' };

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return { success: false, message: 'Invalid credentials' };

      const fullDate = new Date();
      const payload = {
        id: user._id,
        date: fullDate.toISOString(), // Ejemplo: "2025-04-01T12:34:56.789Z"
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      if (!session) await currentSession.commitTransaction();
      return BuildMethodResponse({success: true, status: "Sesión Iniciada", message: "Se ha ingresado al sistema", data: {token}});
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async deactivate(userId, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { active: false },
        { new: true, session: currentSession }
      );
      if (!user) return { success: false, message: 'User not found' };

      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async search(query, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const users = await User.find(query).session(currentSession);
      if (!session) await currentSession.commitTransaction();
      return { success: true, users };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async update(userId, updateData, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        session: currentSession,
      });
      if (!user) return { success: false, message: 'User not found' };

      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async changePassword(userId, newPassword, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = await User.findById(userId).session(currentSession);
      if (!user) return { success: false, message: 'User not found' };
      // Asignamos la nueva contraseña. Con el pre-save se re-hasheará automáticamente.
      user.password = newPassword;
      await user.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async requestPasswordRecovery(email, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      // Verificar que el usuario exista y esté activo
      const user = await User.findOne({ email, active: true }).session(
        currentSession
      );
      if (!user) {
        if (!session) await currentSession.abortTransaction();
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Generar el JWT utilizando el id del usuario y la fecha actual completa
      const fullDate = new Date();
      const payload = {
        id: user._id,
        date: fullDate.toISOString(), // Ejemplo: "2025-04-01T12:34:56.789Z"
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      // Construir el link de recuperación: FE_URL + '/recovery-password/' + token
      const recoveryLink = `${process.env.FE_URL}recovery-password/${token}`;

      // Enviar el correo con el link de recuperación
      await sendEmail(
        user.email,
        'Recuperación de Contraseña',
        `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
      <p>Hola ${user.name || 'Usuario'},</p>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar con el proceso:</p>
      <a 
        href="${recoveryLink}" 
        style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;"
      >
        Restablecer Contraseña
      </a>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p>Gracias,</p>
      <p><strong>El equipo de ASOMAMECO</strong></p>
    </div>
  `
      );

      if (!session) await currentSession.commitTransaction();
      return { success: true, message: 'Correo de recuperación enviado' };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async resetPassword(token, newPassword, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Actualizar la contraseña del usuario usando el método changePassword
      const result = await this.changePassword(
        userId,
        newPassword,
        currentSession
      );
      if (!result.success) {
        if (!session) await currentSession.abortTransaction();
        return { success: false, message: result.message };
      }

      if (!session) await currentSession.commitTransaction();
      return {
        success: true,
        message: 'Contraseña actualizada correctamente',
        user: result.user,
      };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: 'Token inválido o expirado' };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async validateToken(token){
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return BuildMethodResponse({success: true, status: "Válido", message: "El token ha sido validado", data: decoded}) 
    } catch (error) {
      return BuildMethodResponse({
        success: false,
        status: "Inválido",
        message:
        error.name === "TokenExpiredError"
            ? "El token ha expirado"
            : "El token es inválido"
      });
    }
  }
}

module.exports = UserService;
