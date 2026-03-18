const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  yorumId: { type: mongoose.Schema.Types.ObjectId, ref: "Yorum", index: true },
  tip: { type: String, enum: ["psikolojik", "dini"], index: true },
  model: { type: String, default: "" },
  promptVersion: { type: String, default: "" },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  estimatedCostUsd: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model("AIUsage", aiUsageSchema);
