const crypto = require("crypto");
const { authenticator } = require("otplib");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshSession = require("../models/RefreshSession");
const AppError = require("../utils/AppError");
const {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  createDeviceId,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  extractRefreshToken
} = require("../utils/authToken");
const { sendVerificationEmail, sendResetEmail, sendSuspiciousLoginEmail } = require("../utils/email");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateRecoveryCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function getRequestMeta(req) {
  return {
    ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""),
    ua: String(req.headers["user-agent"] || ""),
    deviceId: String(req.headers["x-device-id"] || createDeviceId())
  };
}

function cleanUser(user) {
  return {
    id: user._id,
    email: user.email,
    ad: user.ad,
    role: user.role,
    plan: user.plan,
    aktif: user.aktif,
    emailDogrulandi: user.emailDogrulandi,
    gunlukHak: user.gunlukHak,
    toplamYorum: user.toplamYorum,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount
  };
}

async function issueSession({ user, req, res }) {
  const { ip, ua, deviceId } = getRequestMeta(req);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken({ userId: user._id, deviceId });

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    deviceId,
    userAgent: ua,
    ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

  return {
    accessToken,
    refreshToken,
    deviceId
  };
}

async function register({ email, password, ad }) {
  const emailLower = normalizeEmail(email);

  const exists = await User.findOne({ email: emailLower, deletedAt: null });
  if (exists) throw new AppError("Bu email zaten kayıtlı.", 409, "EMAIL_EXISTS");

  const rawEmailToken = createOpaqueToken();
  const emailTokenHash = hashToken(rawEmailToken);
  const isAdmin = process.env.ADMIN_EMAIL && emailLower === process.env.ADMIN_EMAIL.toLowerCase();

  const user = await User.create({
    email: emailLower,
    password,
    ad,
    emailToken: emailTokenHash,
    role: isAdmin ? "admin" : "user"
  });

  await sendVerificationEmail(user.email, rawEmailToken);
  return user;
}

async function login({ email, password, twoFactorCode, recoveryCode, req }) {
  const emailLower = normalizeEmail(email);
  const user = await User.findOne({ email: emailLower, deletedAt: null });

  if (!user || !user.aktif) {
    throw new AppError("Email veya şifre hatalı.", 401, "INVALID_CREDENTIALS");
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    throw new AppError("Email veya şifre hatalı.", 401, "INVALID_CREDENTIALS");
  }

  if (!user.emailDogrulandi) {
    throw new AppError("Email doğrulanmadan giriş yapılamaz.", 403, "EMAIL_NOT_VERIFIED");
  }

  if (user.twoFactorEnabled) {
    const cleanCode = String(twoFactorCode || "").trim();
    const cleanRecovery = String(recoveryCode || "").trim().toUpperCase();

    if (cleanCode) {
      const valid = authenticator.check(cleanCode, user.twoFactorSecret);
      if (!valid) {
        throw new AppError("2FA kodu geçersiz.", 403, "TWO_FACTOR_INVALID");
      }
    } else if (cleanRecovery) {
      let usedIndex = -1;
      for (let i = 0; i < user.twoFactorRecoveryCodes.length; i += 1) {
        const match = await bcrypt.compare(cleanRecovery, user.twoFactorRecoveryCodes[i]);
        if (match) {
          usedIndex = i;
          break;
        }
      }

      if (usedIndex === -1) {
        throw new AppError("Yedek kurtarma kodu geçersiz.", 403, "TWO_FACTOR_INVALID");
      }

      user.twoFactorRecoveryCodes.splice(usedIndex, 1);
      user.twoFactorRecoveryUpdatedAt = new Date();
    } else {
      throw new AppError("2FA kodu veya yedek kurtarma kodu gerekli.", 403, "TWO_FACTOR_REQUIRED");
    }
  }

  const { ip, ua } = getRequestMeta(req);
  const suspiciousLogin = Boolean(user.lastLoginIp && (user.lastLoginIp !== ip || user.lastLoginUa !== ua));

  user.lastLogin = new Date();
  user.loginCount += 1;
  user.lastLoginIp = ip;
  user.lastLoginUa = ua;
  await user.save();

  if (suspiciousLogin) {
    try {
      await sendSuspiciousLoginEmail(user.email, {
        ip,
        userAgent: ua,
        when: new Date().toLocaleString("tr-TR")
      });
    } catch {
      // Login akışını email hatasında kesmeyelim.
    }
  }

  return { user, suspiciousLogin };
}

async function verifyEmailToken(token) {
  const user = await User.findOne({ emailToken: hashToken(token), deletedAt: null });
  if (!user) throw new AppError("Geçersiz doğrulama tokenı.", 400, "INVALID_TOKEN");

  user.emailDogrulandi = true;
  user.emailToken = undefined;
  await user.save();
  return true;
}

async function forgotPassword(email) {
  const user = await User.findOne({ email: normalizeEmail(email), deletedAt: null });
  if (!user) return true;

  const rawReset = createOpaqueToken();
  user.resetToken = hashToken(rawReset);
  user.resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendResetEmail(user.email, rawReset);
  return true;
}

async function verifyResetToken(token) {
  const user = await User.findOne({
    resetToken: hashToken(token),
    resetTokenExpire: { $gt: new Date() },
    deletedAt: null
  }).select("_id");

  if (!user) throw new AppError("Token geçersiz veya süresi dolmuş.", 400, "INVALID_TOKEN");
  return true;
}

async function resetPassword({ token, yeniSifre }) {
  const user = await User.findOne({
    resetToken: hashToken(token),
    resetTokenExpire: { $gt: new Date() },
    deletedAt: null
  });

  if (!user) throw new AppError("Token geçersiz veya süresi dolmuş.", 400, "INVALID_TOKEN");

  user.password = yeniSifre;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  await user.save();
  return true;
}

async function refresh(req, res) {
  const refreshToken = extractRefreshToken(req);
  if (!refreshToken) throw new AppError("Refresh token bulunamadı.", 401, "UNAUTHORIZED");

  const decoded = verifyToken(refreshToken);
  if (decoded.type !== "refresh") throw new AppError("Geçersiz refresh token.", 401, "UNAUTHORIZED");

  const tokenHash = hashToken(refreshToken);
  const session = await RefreshSession.findOne({ tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } });
  if (!session) throw new AppError("Oturum bulunamadı.", 401, "UNAUTHORIZED");

  const user = await User.findById(session.userId);
  if (!user || !user.aktif || user.deletedAt) throw new AppError("Kullanıcı aktif değil.", 401, "UNAUTHORIZED");

  const newAccess = signAccessToken(user);
  res.cookie(ACCESS_COOKIE, newAccess, accessCookieOptions());

  return { accessToken: newAccess, user: cleanUser(user) };
}

async function listSessions(userId) {
  const sessions = await RefreshSession.find({ userId, expiresAt: { $gt: new Date() }, isRevoked: false })
    .sort({ createdAt: -1 })
    .select("deviceId ip userAgent createdAt expiresAt");

  return sessions;
}

async function revokeSession({ userId, deviceId }) {
  await RefreshSession.updateMany({ userId, deviceId }, { $set: { isRevoked: true } });
  return true;
}

async function updateProfile({ userId, ad }) {
  const cleanName = String(ad || "").trim();
  if (!cleanName) throw new AppError("Ad alanı zorunludur.", 400, "VALIDATION_ERROR");

  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }

  user.ad = cleanName;
  await user.save();
  return user;
}

async function changePassword({ userId, mevcutSifre, yeniSifre }) {
  if (!String(mevcutSifre || "")) {
    throw new AppError("Mevcut şifre zorunludur.", 400, "VALIDATION_ERROR");
  }
  if (String(yeniSifre || "").length < 8) {
    throw new AppError("Yeni şifre en az 8 karakter olmalı.", 400, "VALIDATION_ERROR");
  }

  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }

  const matched = await user.comparePassword(String(mevcutSifre));
  if (!matched) {
    throw new AppError("Mevcut şifre hatalı.", 400, "INVALID_CREDENTIALS");
  }

  user.password = String(yeniSifre);
  await user.save();
  return true;
}

async function beginTwoFactorSetup(userId) {
  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }

  const secret = authenticator.generateSecret();
  user.twoFactorTempSecret = secret;
  await user.save();

  const appName = "RuyaYorum";
  const otpauth = authenticator.keyuri(user.email, appName, secret);
  return { otpauth, secretMasked: `${secret.slice(0, 4)}****${secret.slice(-4)}` };
}

async function enableTwoFactor({ userId, code }) {
  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }
  if (!user.twoFactorTempSecret) {
    throw new AppError("Önce 2FA kurulumu başlatılmalı.", 400, "VALIDATION_ERROR");
  }

  const valid = authenticator.check(String(code || "").trim(), user.twoFactorTempSecret);
  if (!valid) throw new AppError("Doğrulama kodu geçersiz.", 400, "TWO_FACTOR_INVALID");

  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = "";
  user.twoFactorEnabled = true;
  const { plainCodes, hashCodes } = await createRecoveryCodesInternal();
  user.twoFactorRecoveryCodes = hashCodes;
  user.twoFactorRecoveryUpdatedAt = new Date();
  await user.save();
  return { recoveryCodes: plainCodes };
}

async function disableTwoFactor({ userId, code }) {
  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("2FA zaten kapalı.", 400, "VALIDATION_ERROR");
  }

  const valid = authenticator.check(String(code || "").trim(), user.twoFactorSecret);
  if (!valid) throw new AppError("Doğrulama kodu geçersiz.", 400, "TWO_FACTOR_INVALID");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = "";
  user.twoFactorTempSecret = "";
  user.twoFactorRecoveryCodes = [];
  user.twoFactorRecoveryUpdatedAt = null;
  await user.save();
  return true;
}

async function createRecoveryCodesInternal() {
  const plainCodes = Array.from({ length: 8 }, () => generateRecoveryCode());
  const hashCodes = [];
  for (const code of plainCodes) {
    // eslint-disable-next-line no-await-in-loop
    hashCodes.push(await bcrypt.hash(code, 10));
  }
  return { plainCodes, hashCodes };
}

async function regenerateRecoveryCodes({ userId, code }) {
  const user = await User.findById(userId);
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("Önce 2FA etkinleştirilmeli.", 400, "VALIDATION_ERROR");
  }

  const valid = authenticator.check(String(code || "").trim(), user.twoFactorSecret);
  if (!valid) throw new AppError("2FA kodu geçersiz.", 400, "TWO_FACTOR_INVALID");

  const { plainCodes, hashCodes } = await createRecoveryCodesInternal();
  user.twoFactorRecoveryCodes = hashCodes;
  user.twoFactorRecoveryUpdatedAt = new Date();
  await user.save();

  return { recoveryCodes: plainCodes };
}

async function getRecoveryStatus(userId) {
  const user = await User.findById(userId).select("twoFactorEnabled twoFactorRecoveryCodes twoFactorRecoveryUpdatedAt");
  if (!user || !user.aktif || user.deletedAt) {
    throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");
  }
  return {
    enabled: user.twoFactorEnabled,
    remaining: user.twoFactorRecoveryCodes.length,
    updatedAt: user.twoFactorRecoveryUpdatedAt
  };
}

async function logout(req, res, userId = null) {
  const refreshToken = extractRefreshToken(req);
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await RefreshSession.updateMany({ tokenHash }, { $set: { isRevoked: true } });
  }
  if (userId) {
    // no-op, hook point
  }

  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
  res.clearCookie("ruyayorum_token", { path: "/" });
}

module.exports = {
  cleanUser,
  register,
  login,
  issueSession,
  verifyEmailToken,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  refresh,
  listSessions,
  revokeSession,
  updateProfile,
  changePassword,
  beginTwoFactorSetup,
  enableTwoFactor,
  disableTwoFactor,
  regenerateRecoveryCodes,
  getRecoveryStatus,
  logout,
  getRequestMeta
};
