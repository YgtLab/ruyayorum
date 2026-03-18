const mongoose = require("mongoose");

const promptVersionSchema = new mongoose.Schema({
  tip: { type: String, enum: ["psikolojik", "dini"], required: true, index: true },
  version: { type: String, required: true },
  content: { type: String, required: true },
  rollout: { type: Number, default: 100 },
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

promptVersionSchema.index({ tip: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("PromptVersion", promptVersionSchema);
