const User = require("../models/User");
const Yorum = require("../models/Yorum");
const AIUsage = require("../models/AIUsage");
const AuditLog = require("../models/AuditLog");
const RefreshSession = require("../models/RefreshSession");
const AppError = require("../utils/AppError");

async function getDashboardStats() {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

  const [
    toplamKullanici,
    bugunKayit,
    toplamYorum,
    bugunYorum,
    proUye,
    son7GunYorum,
    aiMaliyet
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: startToday }, deletedAt: null }),
    Yorum.countDocuments({ deletedAt: null }),
    Yorum.countDocuments({ createdAt: { $gte: startToday }, deletedAt: null }),
    User.countDocuments({ plan: "pro", deletedAt: null }),
    Yorum.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, deletedAt: null } },
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
    ]),
    AIUsage.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, totalCost: { $sum: "$estimatedCostUsd" }, totalTokens: { $sum: "$totalTokens" } } }
    ])
  ]);

  return {
    toplamKullanici,
    bugunKayit,
    toplamYorum,
    bugunYorum,
    proUye,
    son7GunGrafik: son7GunYorum,
    aiMaliyet: aiMaliyet[0] || { totalCost: 0, totalTokens: 0 }
  };
}

async function listUsers({ page = 1, limit = 20, q = "" }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const keyword = String(q || "").trim();

  const filter = {
    deletedAt: null,
    ...(keyword ? { email: { $regex: keyword, $options: "i" } } : {})
  };

  const [toplam, kullanicilar] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .select("-password -twoFactorSecret")
  ]);

  return { page: safePage, limit: safeLimit, toplam, kullanicilar };
}

async function updateUser({ id, plan, aktif, role }) {
  const update = {};
  if (["free", "pro"].includes(plan)) update.plan = plan;
  if (typeof aktif === "boolean") update.aktif = aktif;
  if (["user", "admin"].includes(role)) update.role = role;

  const user = await User.findOneAndUpdate({ _id: id, deletedAt: null }, update, { new: true }).select("-password -twoFactorSecret");
  if (!user) throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");

  return user;
}

async function softDeleteUser({ id, actorId }) {
  if (String(id) === String(actorId)) {
    throw new AppError("Kendi hesabını silemezsin.", 400, "BAD_REQUEST");
  }

  const user = await User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), aktif: false },
    { new: true }
  );

  if (!user) throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");

  await Yorum.updateMany({ userId: id, deletedAt: null }, { deletedAt: new Date() });

  return true;
}

async function listAudit({ page = 1, limit = 30 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 30));

  const [toplam, logs] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return { page: safePage, limit: safeLimit, toplam, logs };
}

async function getUserDetail(userId) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select("-password -twoFactorSecret");
  if (!user) throw new AppError("Kullanıcı bulunamadı.", 404, "NOT_FOUND");

  const [sonYorumlar, aktifOturumlar, aiKullanim, toplamYorum] = await Promise.all([
    Yorum.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("ruya tip puan createdAt"),
    RefreshSession.find({ userId, isRevoked: false, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("deviceId ip userAgent createdAt expiresAt"),
    AIUsage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("model totalTokens estimatedCostUsd qualityScore createdAt"),
    Yorum.countDocuments({ userId, deletedAt: null })
  ]);

  const toplamMaliyet = aiKullanim.reduce((acc, row) => acc + Number(row.estimatedCostUsd || 0), 0);
  const toplamToken = aiKullanim.reduce((acc, row) => acc + Number(row.totalTokens || 0), 0);

  return {
    user,
    toplamYorum,
    aktifOturumSayisi: aktifOturumlar.length,
    aiOzet: {
      toplamMaliyetUsd: Number(toplamMaliyet.toFixed(6)),
      toplamToken
    },
    sonYorumlar,
    aktifOturumlar,
    aiKullanim
  };
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUser,
  softDeleteUser,
  listAudit,
  getUserDetail
};
