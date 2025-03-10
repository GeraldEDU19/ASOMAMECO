const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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
      const user = await User.findOne({ email, active: true }).session(currentSession);
      if (!user) return { success: false, message: "Invalid credentials" };

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return { success: false, message: "Invalid credentials" };

      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
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
      const user = await User.findByIdAndUpdate(userId, { active: false }, { new: true, session: currentSession });
      if (!user) return { success: false, message: "User not found" };

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
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true, session: currentSession });
      if (!user) return { success: false, message: "User not found" };

      if (!session) await currentSession.commitTransaction();
      return { success: true, user };
    } catch (error) {
      if (!session) await currentSession.abortTransaction();
      return { success: false, message: error.message };
    } finally {
      if (!session) currentSession.endSession();
    }
  }

  // Nuevo método para cambiar la contraseña
  static async changePassword(userId, newPassword, session = null) {
    const currentSession = session || (await mongoose.startSession());
    if (!session) currentSession.startTransaction();

    try {
      const user = await User.findById(userId).session(currentSession);
      if (!user) return { success: false, message: "User not found" };
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
}

module.exports = UserService;
