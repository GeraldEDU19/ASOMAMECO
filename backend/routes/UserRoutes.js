const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");


router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/validate-token", UserController.validateToken);
router.put("/:id", UserController.update);
router.put("/:id/change-password", UserController.changePassword);
router.delete("/:id", UserController.deactivate);
router.get("/search", UserController.search);
router.post("/request-pasword-recovery", UserController.requestPasswordRecovery);
router.post("/reset-password", UserController.resetPassword);

module.exports = router;
