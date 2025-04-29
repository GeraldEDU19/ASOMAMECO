// models/Event.js
const mongoose = require("mongoose");
const mongooseAutopopulate = require("mongoose-autopopulate");

const EventSchema = new mongoose.Schema({
  name:       { type: String,  required: true, trim: true },
  date:       { type: Date,    required: true },
  description:{ type: String,  default: "" },
  location:   { type: String,  default: "" },
  active:     { type: Boolean, default: true },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendee",
      autopopulate: true
    }
  ]
}, { timestamps: true });

EventSchema.plugin(mongooseAutopopulate);

module.exports = mongoose.model("Event", EventSchema);
