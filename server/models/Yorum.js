const mongoose = require("mongoose");

const yorumSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ownerKey: String,
  ruya: String,
  tip: { type: String, enum: ["psikolojik", "dini"] },
  yorum: String,
  puan: { type: Number, enum: [-1, 0, 1], default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  deletedAt: { type: Date, default: null, index: true }
});

yorumSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Yorum", yorumSchema);
