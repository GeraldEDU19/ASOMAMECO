const UserService = require("../services/UserService");

const UserController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await UserService.register({ name, email, password });
      if (result.success) {
        res.status(201).json(result.user);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      if (result.success) {
        res.status(200).json(result.user);
      } else {
        res.status(401).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const result = await UserService.update(userId, updateData);
      if (result.success) {
        res.status(200).json(result.user);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      const result = await UserService.changePassword(userId, newPassword);
      if (result.success) {
        res.status(200).json(result.user);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deactivate: async (req, res) => {
    try {
      const userId = req.params.id;
      const result = await UserService.deactivate(userId);
      if (result.success) {
        res.status(200).json(result.user);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query;
      const result = await UserService.search(query);
      if (result.success) {
        res.status(200).json(result.users);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  requestPasswordRecovery: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await UserService.requestPasswordRecovery(email);
      if (result.success) {
        res.status(200).json(result.user);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = UserController;
