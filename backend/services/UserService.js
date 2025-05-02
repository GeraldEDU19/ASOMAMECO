const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const EmailService = require('../utils/sendEmail');

class UserService {
  static async register(userData, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = new User(userData);
      await user.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'CREATED',
        message: "user.registered",
        data: { user }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
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
      
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'INVALID_DATA',
        message: "user.invalid_credentials"
      });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return global.BuildMethodResponse({
        success: false,
        status: 'INVALID_DATA',
        message: "user.invalid_credentials"
      });

      const fullDate = new Date();
      const payload = {
        id: user._id,
        date: fullDate.toISOString(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'SUCCESS',
        message: "user.logged_in",
        data: { token }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
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
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'NOT_FOUND',
        message: "user.not_found"
      });

      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'UPDATED',
        message: "user.deactivated",
        data: { user }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
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
      return global.BuildMethodResponse({
        success: true,
        status: 'SUCCESS',
        message: "success",
        data: users
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
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
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'NOT_FOUND',
        message: "user.not_found"
      });

      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'UPDATED',
        message: "user.updated",
        data: { user }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async changePassword(userId, newPassword, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = await User.findById(userId).session(currentSession);
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'NOT_FOUND',
        message: "user.not_found"
      });

      user.password = newPassword;
      await user.save({ session: currentSession });
      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'UPDATED',
        message: "user.password_changed",
        data: { user }
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: error.message
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async requestPasswordRecovery(email, language = 'es') {
    const user = await User.findOne({ email, active: true });
    if (!user) {
      throw new Error('User not found');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const recoveryLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await EmailService.sendPasswordRecoveryEmail(
      user.email,
      user.name,
      recoveryLink,
      language
    );

    return { message: 'Recovery email sent' };
  }

  static async getUserByEmail(email) {
    // Implementar la lógica para obtener el usuario por email
    // Esto es un placeholder, debes implementar la lógica real
    return {
      id: 1,
      email: 'user@example.com',
      name: 'User Name',
      language: 'es'
    };
  }

  static async resetPassword(token, newPassword, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).session(currentSession);
      
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'NOT_FOUND',
        message: "user.not_found"
      });

      user.password = newPassword;
      await user.save({ session: currentSession });
      
      if (!session) await currentSession.commitTransaction();
      return global.BuildMethodResponse({
        success: true,
        status: 'UPDATED',
        message: "user.password_reset"
      });
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: "user.token_invalid"
      });
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  static async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) return global.BuildMethodResponse({
        success: false,
        status: 'NOT_FOUND',
        message: "user.not_found"
      });

      return global.BuildMethodResponse({
        success: true,
        status: 'SUCCESS',
        message: "user.token_valid"
      });
    } catch (error) {
      return global.BuildMethodResponse({
        success: false,
        status: 'ERROR',
        message: "user.token_invalid"
      });
    }
  }
}

module.exports = UserService;
