const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendVerificationEmail, sendResetEmail } = require("../utils/email");
const { authCookieOptions } = require("../utils/authToken");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function cleanUser(user) {
  return {
    id: user._id,
    email: user.email,
    ad: user.ad,
    role: user.role,
    plan: user.plan,
    gunlukHak: user.gunlukHak,
    emailDogrulandi: user.emailDogrulandi,
    aktif: user.aktif,
    toplamYorum: user.toplamYorum,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount
  };
}

function setAuthCookie(res, token) {
  res.cookie("ruyayorum_token", token, authCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie("ruyayorum_token", { path: "/" });
}

router.post(
  "/kayit",
  [
    body("email").isEmail().withMessage("Geçerli bir email girin."),
    body("password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalı."),
    body("ad").trim().notEmpty().withMessage("Ad alanı zorunludur.")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg, detaylar: errors.array() });
      }

      const { email, password, ad } = req.body;
      const emailLower = email.toLowerCase();

      const exists = await User.findOne({ email: emailLower });
      if (exists) {
        return res.status(409).json({ error: "Bu email zaten kayıtlı." });
      }

      const rawEmailToken = crypto.randomBytes(24).toString("hex");
      const isAdmin = process.env.ADMIN_EMAIL && emailLower === process.env.ADMIN_EMAIL.toLowerCase();

      const user = await User.create({
        email: emailLower,
        password,
        ad,
        emailToken: hashToken(rawEmailToken),
        role: isAdmin ? "admin" : "user"
      });

      await sendVerificationEmail(user.email, rawEmailToken);

      const token = signToken(user._id);
      setAuthCookie(res, token);

      return res.status(201).json({
        mesaj: "Kayıt başarılı. Lütfen email doğrulaması yap.",
        token,
        user: cleanUser(user)
      });
    } catch (error) {
      return res.status(500).json({ error: "Kayıt sırasında hata oluştu.", detay: error.message });
    }
  }
);

router.post(
  "/giris",
  [
    body("email").isEmail().withMessage("Geçerli email girin."),
    body("password").notEmpty().withMessage("Şifre gerekli.")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg, detaylar: errors.array() });
      }

      const { email, password } = req.body;
      const emailLower = email.toLowerCase();

      const user = await User.findOne({ email: emailLower });
      if (!user || !user.aktif) {
        return res.status(401).json({ error: "Email veya şifre hatalı." });
      }

      const matched = await user.comparePassword(password);
      if (!matched) {
        return res.status(401).json({ error: "Email veya şifre hatalı." });
      }

      if (!user.emailDogrulandi) {
        return res.status(403).json({ error: "Email doğrulanmadan giriş yapılamaz." });
      }

      if (process.env.ADMIN_EMAIL && emailLower === process.env.ADMIN_EMAIL.toLowerCase() && user.role !== "admin") {
        user.role = "admin";
      }

      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      const token = signToken(user._id);
      setAuthCookie(res, token);

      return res.json({ mesaj: "Giriş başarılı.", token, user: cleanUser(user) });
    } catch (error) {
      return res.status(500).json({ error: "Giriş sırasında hata oluştu.", detay: error.message });
    }
  }
);

router.post("/cikis", (_req, res) => {
  try {
    clearAuthCookie(res);
    return res.json({ mesaj: "Çıkış yapıldı." });
  } catch (error) {
    return res.status(500).json({ error: "Çıkış sırasında hata oluştu.", detay: error.message });
  }
});

router.get("/dogrula", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Doğrulama tokenı gerekli." });

    const user = await User.findOne({ emailToken: hashToken(String(token)) });
    if (!user) return res.status(400).json({ error: "Geçersiz doğrulama tokenı." });

    user.emailDogrulandi = true;
    user.emailToken = undefined;
    await user.save();

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ mesaj: "Email doğrulandı." });
    }
    return res.redirect("/auth.html?verified=1");
  } catch (error) {
    return res.status(500).json({ error: "Doğrulama sırasında hata oluştu.", detay: error.message });
  }
});

router.post(
  "/sifremi-unuttum",
  [body("email").isEmail().withMessage("Geçerli email girin.")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg, detaylar: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.json({ mesaj: "Email gönderildi." });
      }

      const rawResetToken = crypto.randomBytes(24).toString("hex");
      user.resetToken = hashToken(rawResetToken);
      user.resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      await sendResetEmail(user.email, rawResetToken);
      return res.json({ mesaj: "Email gönderildi." });
    } catch (error) {
      return res.status(500).json({ error: "Şifre sıfırlama isteği sırasında hata oluştu.", detay: error.message });
    }
  }
);

router.get("/sifre-sifirla-dogrula", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token gerekli." });

    const user = await User.findOne({
      resetToken: hashToken(String(token)),
      resetTokenExpire: { $gt: new Date() }
    }).select("_id");

    if (!user) return res.status(400).json({ error: "Token geçersiz veya süresi dolmuş." });

    return res.json({ gecerli: true });
  } catch (error) {
    return res.status(500).json({ error: "Token doğrulanamadı.", detay: error.message });
  }
});

router.post(
  "/sifre-sifirla",
  [
    body("token").notEmpty().withMessage("Token gerekli."),
    body("yeniSifre").isLength({ min: 6 }).withMessage("Yeni şifre en az 6 karakter olmalı.")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg, detaylar: errors.array() });
      }

      const { token, yeniSifre } = req.body;
      const user = await User.findOne({
        resetToken: hashToken(String(token)),
        resetTokenExpire: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ error: "Token geçersiz veya süresi dolmuş." });
      }

      user.password = yeniSifre;
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();

      return res.json({ mesaj: "Şifre başarıyla güncellendi." });
    } catch (error) {
      return res.status(500).json({ error: "Şifre sıfırlama sırasında hata oluştu.", detay: error.message });
    }
  }
);

router.get("/ben", auth, async (req, res) => {
  try {
    return res.json({ user: cleanUser(req.user) });
  } catch (error) {
    return res.status(500).json({ error: "Kullanıcı bilgisi alınamadı.", detay: error.message });
  }
});

module.exports = router;
