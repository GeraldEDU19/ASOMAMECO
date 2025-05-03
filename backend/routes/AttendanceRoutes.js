const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/AttendanceController");

router.get("/validate-attendance/:token",AttendanceController.validateAttendanceToken);
router.get("/check-attendance/:token", AttendanceController.checkAttendanceToken);

module.exports = router;
