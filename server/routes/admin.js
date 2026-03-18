const express = require("express");
const User = require("../models/User");
const Yorum = require("../models/Yorum");
const auth = require("../middleware/auth");

const router = express.Router();

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin yetkisi gerekli." });
  }
  return next();
}

router.use(auth, ensureAdmin);

router.get("/istatistik", async (_req, res) => {
  try {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const [
      toplamKullanici,
      bugunKayit,
      toplamYorum,
      bugunYorum,
      proUye,
      yediGunYorum
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startToday } }),
      Yorum.countDocuments(),
      Yorum.countDocuments({ createdAt: { $gte: startToday } }),
      User.countDocuments({ plan: "pro" }),
      Yorum.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" }
            },
            sayi: { $sum: 1 }
          }
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } }
      ])
    ]);

    return res.json({
      toplamKullanici,
      bugunKayit,
      toplamYorum,
      bugunYorum,
      proUye,
      son7GunGrafik: yediGunYorum
    });
  } catch (error) {
    return res.status(500).json({ error: "İstatistik alınamadı.", detay: error.message });
  }
});

router.get("/kullanicilar", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const q = String(req.query.q || "").trim();

    const filter = q ? { email: { $regex: q, $options: "i" } } : {};

    const [toplam, kullanicilar] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password")
    ]);

    return res.json({ page, limit, toplam, kullanicilar });
  } catch (error) {
    return res.status(500).json({ error: "Kullanıcılar listelenemedi.", detay: error.message });
  }
});

router.put("/kullanici/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, aktif } = req.body;

    const update = {};
    if (["free", "pro"].includes(plan)) update.plan = plan;
    if (typeof aktif === "boolean") update.aktif = aktif;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    return res.json({ mesaj: "Kullanıcı güncellendi.", user });
  } catch (error) {
    return res.status(500).json({ error: "Kullanıcı güncellenemedi.", detay: error.message });
  }
});

router.delete("/kullanici/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) === String(id)) {
      return res.status(400).json({ error: "Kendi hesabını bu panelden silemezsin." });
    }
    await Yorum.deleteMany({ userId: id });
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    return res.json({ mesaj: "Kullanıcı silindi." });
  } catch (error) {
    return res.status(500).json({ error: "Kullanıcı silinemedi.", detay: error.message });
  }
});

module.exports = router;
