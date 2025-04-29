const express = require("express");
const router = express.Router();
const EventController = require("../controllers/EventController");


router.post("/", EventController.create);
router.put("/:id", EventController.update);
router.get("/search", EventController.search);
router.delete("/:id", EventController.deactivate);
router.post("/:id/attendance", EventController.registerAttendance);
router.get("/:id/report", EventController.getReport);

module.exports = router;
