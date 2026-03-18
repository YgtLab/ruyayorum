const mongoose = require("mongoose");

const refreshSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  tokenHash: { type: String, required: true, index: true },
  deviceId: { type: String, required: true, index: true },
  userAgent: { type: String, default: "" },
  ip: { type: String, default: "" },
  isRevoked: { type: Boolean, default: false },
  expiresAt: { type: Date, index: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RefreshSession", refreshSessionSchema);
