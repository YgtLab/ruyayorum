const User = require("../models/User");
const { extractToken, verifyToken } = require("../utils/authToken");

async function auth(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Yetkisiz erişim." } });
    }

    const decoded = verifyToken(token);
    if (decoded.type && decoded.type !== "access") {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Geçersiz token tipi." } });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.aktif || user.deletedAt) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Kullanıcı bulunamadı veya pasif." } });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Geçersiz veya süresi dolmuş token." } });
  }
}

module.exports = auth;
