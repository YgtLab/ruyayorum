const User = require("../models/User");
const { extractToken, verifyToken } = require("../utils/authToken");

async function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    if (decoded.type && decoded.type !== "access") {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    req.user = user && user.aktif && !user.deletedAt ? user : null;
    return next();
  } catch {
    req.user = null;
    return next();
  }
}

module.exports = optionalAuth;
