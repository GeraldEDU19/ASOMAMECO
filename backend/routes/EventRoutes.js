const express = require("express");
const router = express.Router();
const EventController = require("../controllers/EventController");


router.post("/", EventController.create);
router.put("/:id", EventController.update);
router.get("/search", EventController.search);
router.get("/report", EventController.getReport);
router.delete("/:id", EventController.deactivate);


module.exports = router;
