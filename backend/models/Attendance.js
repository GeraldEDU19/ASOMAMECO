// models/Attendance.js
const mongoose = require("mongoose");
const mongooseAutopopulate = require("mongoose-autopopulate");

const AttendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true,
  },
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Affiliate",
    required: true,
    index: true,
    autopopulate: true
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false
  },
  attended: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

AttendanceSchema.index({ event: 1, affiliate: 1 }, { unique: true });
AttendanceSchema.plugin(mongooseAutopopulate);

module.exports = mongoose.model("Attendance", AttendanceSchema);
