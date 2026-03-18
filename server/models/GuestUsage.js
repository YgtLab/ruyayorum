const mongoose = require("mongoose");

const guestUsageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true, index: true }
});

module.exports = mongoose.model("GuestUsage", guestUsageSchema);
