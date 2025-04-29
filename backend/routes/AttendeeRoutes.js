const express = require("express");
const router = express.Router();
const AttendeeController = require("../controllers/AttendeeController");

router.get("/validate-attendance/:token",AttendeeController.validateAttendanceToken);
router.get("/check-attendance/:token", AttendeeController.checkAttendanceToken);

module.exports = router;
