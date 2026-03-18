const AuditLog = require("../models/AuditLog");

async function logAudit({ actorUserId, action, targetType = "", targetId = "", ip = "", userAgent = "", meta = {} }) {
  return AuditLog.create({ actorUserId, action, targetType, targetId, ip, userAgent, meta });
}

module.exports = { logAudit };
