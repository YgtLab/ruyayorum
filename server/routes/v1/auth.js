const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, query } = require("express-validator");
const QRCode = require("qrcode");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../middleware/asyncHandler");
const { ok } = require("../../utils/apiResponse");
const AppError = require("../../utils/AppError");
const authService = require("../../services/authService");
const { logAudit } = require("../../services/auditService");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Çok fazla giriş denemesi. Lütfen biraz bekle." }
  }
});

router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Geçerli bir email girin."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Şifre en az 8 karakter olmalı.")
      .matches(/[A-Z]/)
      .withMessage("Şifrede en az 1 büyük harf olmalı.")
      .matches(/[a-z]/)
      .withMessage("Şifrede en az 1 küçük harf olmalı.")
      .matches(/[0-9]/)
      .withMessage("Şifrede en az 1 rakam olmalı."),
    body("ad").trim().notEmpty().withMessage("Ad alanı zorunludur.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    await authService.issueSession({ user, req, res });
    await logAudit({
      actorUserId: user._id,
      action: "AUTH_REGISTER",
      targetType: "user",
      targetId: String(user._id),
      ip: authService.getRequestMeta(req).ip,
      userAgent: authService.getRequestMeta(req).ua
    });

    return ok(res, { user: authService.cleanUser(user) }, "Kayıt başarılı. Lütfen email doğrulayın.", 201);
  })
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Geçerli email girin."),
    body("password").notEmpty().withMessage("Şifre gerekli."),
    body("twoFactorCode").optional().isString().withMessage("2FA kodu metin olmalı."),
    body("recoveryCode").optional().isString().withMessage("Yedek kurtarma kodu metin olmalı.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { user, suspiciousLogin } = await authService.login({
      email: req.body.email,
      password: req.body.password,
      twoFactorCode: req.body.twoFactorCode,
      recoveryCode: req.body.recoveryCode,
      req
    });
    await authService.issueSession({ user, req, res });

    await logAudit({
      actorUserId: user._id,
      action: "AUTH_LOGIN",
      targetType: "user",
      targetId: String(user._id),
      ip: authService.getRequestMeta(req).ip,
      userAgent: authService.getRequestMeta(req).ua,
      meta: { suspiciousLogin }
    });

    return ok(res, { user: authService.cleanUser(user), suspiciousLogin }, "Giriş başarılı.");
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const result = await authService.refresh(req, res);
    return ok(res, result, "Oturum yenilendi.");
  })
);

router.post(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    await authService.logout(req, res, req.user._id);
    await logAudit({
      actorUserId: req.user._id,
      action: "AUTH_LOGOUT",
      targetType: "user",
      targetId: String(req.user._id),
      ip: authService.getRequestMeta(req).ip,
      userAgent: authService.getRequestMeta(req).ua
    });
    return ok(res, {}, "Çıkış yapıldı.");
  })
);

router.get(
  "/verify-email",
  [query("token").notEmpty().withMessage("Token gerekli.")],
  validate,
  asyncHandler(async (req, res) => {
    await authService.verifyEmailToken(String(req.query.token));

    if ((req.headers.accept || "").includes("application/json")) {
      return ok(res, {}, "Email doğrulandı.");
    }

    return res.redirect("/auth.html?verified=1");
  })
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Geçerli email girin.")],
  validate,
  asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    return ok(res, {}, "Email gönderildi.");
  })
);

router.get(
  "/verify-reset-token",
  [query("token").notEmpty().withMessage("Token gerekli.")],
  validate,
  asyncHandler(async (req, res) => {
    await authService.verifyResetToken(String(req.query.token));
    return ok(res, { valid: true }, "Token geçerli.");
  })
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token gerekli."),
    body("yeniSifre")
      .isLength({ min: 8 })
      .withMessage("Yeni şifre en az 8 karakter olmalı.")
      .matches(/[A-Z]/)
      .withMessage("Yeni şifrede en az 1 büyük harf olmalı.")
      .matches(/[a-z]/)
      .withMessage("Yeni şifrede en az 1 küçük harf olmalı.")
      .matches(/[0-9]/)
      .withMessage("Yeni şifrede en az 1 rakam olmalı.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    return ok(res, {}, "Şifre güncellendi.");
  })
);

router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    return ok(res, { user: authService.cleanUser(req.user) });
  })
);

router.get(
  "/sessions",
  auth,
  asyncHandler(async (req, res) => {
    const sessions = await authService.listSessions(req.user._id);
    return ok(res, { sessions });
  })
);

router.post(
  "/2fa/setup-begin",
  auth,
  asyncHandler(async (req, res) => {
    const result = await authService.beginTwoFactorSetup(req.user._id);
    const qrDataUrl = await QRCode.toDataURL(result.otpauth);
    return ok(res, { ...result, qrDataUrl }, "2FA kurulumu başlatıldı.");
  })
);

router.post(
  "/2fa/enable",
  auth,
  [body("code").isString().notEmpty().withMessage("2FA doğrulama kodu gerekli.")],
  validate,
  asyncHandler(async (req, res) => {
    const result = await authService.enableTwoFactor({ userId: req.user._id, code: req.body.code });
    return ok(res, result, "2FA etkinleştirildi.");
  })
);

router.post(
  "/2fa/disable",
  auth,
  [body("code").isString().notEmpty().withMessage("2FA doğrulama kodu gerekli.")],
  validate,
  asyncHandler(async (req, res) => {
    await authService.disableTwoFactor({ userId: req.user._id, code: req.body.code });
    return ok(res, {}, "2FA kapatıldı.");
  })
);

router.get(
  "/2fa/recovery-codes/status",
  auth,
  asyncHandler(async (req, res) => {
    const status = await authService.getRecoveryStatus(req.user._id);
    return ok(res, status);
  })
);

router.post(
  "/2fa/recovery-codes/regenerate",
  auth,
  [body("code").isString().notEmpty().withMessage("2FA doğrulama kodu gerekli.")],
  validate,
  asyncHandler(async (req, res) => {
    const result = await authService.regenerateRecoveryCodes({ userId: req.user._id, code: req.body.code });
    return ok(res, result, "Yedek kurtarma kodları yenilendi.");
  })
);

router.patch(
  "/profile",
  auth,
  [body("ad").trim().notEmpty().withMessage("Ad alanı zorunludur.")],
  validate,
  asyncHandler(async (req, res) => {
    const user = await authService.updateProfile({ userId: req.user._id, ad: req.body.ad });
    return ok(res, { user: authService.cleanUser(user) }, "Profil güncellendi.");
  })
);

router.post(
  "/change-password",
  auth,
  [
    body("mevcutSifre").notEmpty().withMessage("Mevcut şifre gerekli."),
    body("yeniSifre")
      .isLength({ min: 8 })
      .withMessage("Yeni şifre en az 8 karakter olmalı.")
      .matches(/[A-Z]/)
      .withMessage("Yeni şifrede en az 1 büyük harf olmalı.")
      .matches(/[a-z]/)
      .withMessage("Yeni şifrede en az 1 küçük harf olmalı.")
      .matches(/[0-9]/)
      .withMessage("Yeni şifrede en az 1 rakam olmalı.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    await authService.changePassword({
      userId: req.user._id,
      mevcutSifre: req.body.mevcutSifre,
      yeniSifre: req.body.yeniSifre
    });

    await logAudit({
      actorUserId: req.user._id,
      action: "AUTH_CHANGE_PASSWORD",
      targetType: "user",
      targetId: String(req.user._id),
      ip: authService.getRequestMeta(req).ip,
      userAgent: authService.getRequestMeta(req).ua
    });

    return ok(res, {}, "Şifre güncellendi.");
  })
);

router.delete(
  "/sessions/:deviceId",
  auth,
  asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    if (!deviceId) throw new AppError("Cihaz kimliği gerekli.", 400, "VALIDATION_ERROR");

    await authService.revokeSession({ userId: req.user._id, deviceId });
    await logAudit({
      actorUserId: req.user._id,
      action: "AUTH_REVOKE_SESSION",
      targetType: "session",
      targetId: deviceId,
      ip: authService.getRequestMeta(req).ip,
      userAgent: authService.getRequestMeta(req).ua
    });

    return ok(res, {}, "Oturum kapatıldı.");
  })
);

module.exports = router;
