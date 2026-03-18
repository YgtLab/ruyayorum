const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Yorum = require("../models/Yorum");
const User = require("../models/User");
const GuestUsage = require("../models/GuestUsage");
const { buildPrompt } = require("../utils/prompt");
const { extractToken } = require("../utils/authToken");

const router = express.Router();
const ONE_DAY = 86400000;
const GUEST_LIMIT = 2;

function getGuestKey(req) {
  const source = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "guest";
  return crypto.createHash("sha256").update(String(source)).digest("hex");
}

async function getGuestUsage(key) {
  const now = new Date();
  let entry = await GuestUsage.findOne({ key });

  if (!entry || entry.resetAt <= now) {
    entry = await GuestUsage.findOneAndUpdate(
      { key },
      {
        count: 0,
        resetAt: new Date(Date.now() + ONE_DAY)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return entry;
}

async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.aktif) {
      return res.status(401).json({ error: "Oturum geçersiz. Lütfen tekrar giriş yap." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Oturum geçersiz veya süresi dolmuş." });
  }
}

async function syncDailyHak(user) {
  const now = Date.now();
  if (!user.hakSifirlamaTarihi || now - new Date(user.hakSifirlamaTarihi).getTime() > ONE_DAY) {
    user.gunlukHak = user.plan === "pro" ? 999999 : 2;
    user.hakSifirlamaTarihi = new Date();
    await user.save();
  }
}

router.get("/hak", optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      await syncDailyHak(req.user);
      return res.json({ plan: req.user.plan, kalanHak: req.user.plan === "pro" ? "sinirsiz" : req.user.gunlukHak });
    }

    const guestEntry = await getGuestUsage(getGuestKey(req));
    return res.json({ plan: "guest", kalanHak: Math.max(0, GUEST_LIMIT - guestEntry.count) });
  } catch (error) {
    return res.status(500).json({ error: "Hak bilgisi alınamadı.", detay: error.message });
  }
});

router.get("/istatistik", optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ buAy: 0, toplam: 0 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [buAy, toplam] = await Promise.all([
      Yorum.countDocuments({ userId: req.user._id, createdAt: { $gte: monthStart } }),
      Yorum.countDocuments({ userId: req.user._id })
    ]);

    return res.json({ buAy, toplam });
  } catch (error) {
    return res.status(500).json({ error: "İstatistik alınamadı.", detay: error.message });
  }
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { ruya, tip } = req.body;

    if (!ruya || typeof ruya !== "string" || !ruya.trim()) {
      return res.status(400).json({ error: "Rüya metni boş olamaz." });
    }
    if (ruya.length > 500) {
      return res.status(400).json({ error: "Rüya metni çok uzun." });
    }
    if (!["psikolojik", "dini"].includes(tip)) {
      return res.status(400).json({ error: "Geçersiz yorum tipi." });
    }

    let guestEntry = null;

    if (req.user) {
      await syncDailyHak(req.user);
      if (req.user.plan !== "pro" && req.user.gunlukHak <= 0) {
        return res.status(429).json({ error: "Günlük hakkın bitti. Yarın tekrar dene." });
      }
    } else {
      guestEntry = await getGuestUsage(getGuestKey(req));
      if (guestEntry.count >= GUEST_LIMIT) {
        return res.status(429).json({ error: "Misafir günlük hak bitti. Giriş yaparak devam edebilirsin." });
      }
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: buildPrompt(ruya.trim(), tip) }],
        max_tokens: 1500,
        temperature: 0.95
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "API hatası");

    const yorumMetni = data?.choices?.[0]?.message?.content?.trim();
    if (!yorumMetni) throw new Error("Yorum üretilemedi.");

    const yorum = await Yorum.create({
      userId: req.user?._id,
      ownerKey: req.user ? undefined : getGuestKey(req),
      ruya: ruya.trim(),
      tip,
      yorum: yorumMetni
    });

    let kalanHak = 0;
    if (req.user) {
      if (req.user.plan !== "pro") req.user.gunlukHak = Math.max(0, req.user.gunlukHak - 1);
      req.user.toplamYorum += 1;
      await req.user.save();
      kalanHak = req.user.plan === "pro" ? "sinirsiz" : req.user.gunlukHak;
    } else if (guestEntry) {
      guestEntry.count += 1;
      await guestEntry.save();
      kalanHak = Math.max(0, GUEST_LIMIT - guestEntry.count);
    }

    return res.json({ yorumId: yorum._id, yorum: yorumMetni, kalanHak });
  } catch (error) {
    return res.status(500).json({ error: "Yorum alınamadı.", detay: error.message });
  }
});

router.get("/gecmis", optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Geçmiş yorumlar için giriş yapmalısın." });
    }

    const gecmis = await Yorum.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("ruya tip yorum puan createdAt");

    return res.json({ yorumlar: gecmis });
  } catch (error) {
    return res.status(500).json({ error: "Geçmiş yorumlar alınamadı.", detay: error.message });
  }
});

router.patch("/:id/puan", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { puan } = req.body;

    if (![1, -1, 0].includes(Number(puan))) {
      return res.status(400).json({ error: "Geçersiz puan." });
    }

    const filter = req.user
      ? { _id: id, userId: req.user._id }
      : { _id: id, ownerKey: getGuestKey(req) };

    const updated = await Yorum.findOneAndUpdate(filter, { puan: Number(puan) }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Yorum bulunamadı." });
    }

    return res.json({ mesaj: "Puan kaydedildi." });
  } catch (error) {
    return res.status(500).json({ error: "Puan kaydedilemedi.", detay: error.message });
  }
});

router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const filter = req.user
      ? { _id: req.params.id, userId: req.user._id }
      : { _id: req.params.id, ownerKey: getGuestKey(req) };
    const deleted = await Yorum.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ error: "Yorum bulunamadı." });
    }

    return res.json({ mesaj: "Yorum silindi." });
  } catch (error) {
    return res.status(500).json({ error: "Yorum silinemedi.", detay: error.message });
  }
});

module.exports = router;
