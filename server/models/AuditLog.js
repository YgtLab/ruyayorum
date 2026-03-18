const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, default: "" },
  targetId: { type: String, default: "" },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
