const express = require("express");
const router = express.Router();
const AffiliateController = require("../controllers/AffiliateController");


router.post("/", AffiliateController.create);
router.post("/bulk",AffiliateController.bulkCreate);
router.put("/:id", AffiliateController.update);
router.get("/search", AffiliateController.search);
router.delete("/:id", AffiliateController.deactivate);
router.post("/:id/attendance", AffiliateController.registerAttendance);
router.get("/:id/report", AffiliateController.getReport)
module.exports = router;
