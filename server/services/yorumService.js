const crypto = require("crypto");
const Yorum = require("../models/Yorum");
const User = require("../models/User");
const GuestUsage = require("../models/GuestUsage");
const AIUsage = require("../models/AIUsage");
const AppError = require("../utils/AppError");
const { resolvePrompt } = require("./promptService");
const { generateInterpretation } = require("./aiService");

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
      { count: 0, resetAt: new Date(Date.now() + ONE_DAY) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return entry;
}

async function syncDailyHak(user) {
  const now = Date.now();
  if (!user.hakSifirlamaTarihi || now - new Date(user.hakSifirlamaTarihi).getTime() > ONE_DAY) {
    user.gunlukHak = user.plan === "pro" ? 999999 : 2;
    user.hakSifirlamaTarihi = new Date();
    await user.save();
  }
}

async function getHak(req, user) {
  if (user) {
    await syncDailyHak(user);
    return { plan: user.plan, kalanHak: user.plan === "pro" ? "sinirsiz" : user.gunlukHak };
  }

  const guestEntry = await getGuestUsage(getGuestKey(req));
  return { plan: "guest", kalanHak: Math.max(0, GUEST_LIMIT - guestEntry.count) };
}

async function createYorum({ req, user, ruya, tip }) {
  if (!ruya || typeof ruya !== "string" || !ruya.trim()) {
    throw new AppError("Rüya metni boş olamaz.", 400, "VALIDATION_ERROR");
  }
  if (ruya.length > 500) {
    throw new AppError("Rüya metni çok uzun.", 400, "VALIDATION_ERROR");
  }
  if (!["psikolojik", "dini"].includes(tip)) {
    throw new AppError("Geçersiz yorum tipi.", 400, "VALIDATION_ERROR");
  }

  let guestEntry = null;
  if (user) {
    await syncDailyHak(user);
    if (user.plan !== "pro" && user.gunlukHak <= 0) {
      throw new AppError("Günlük hakkın bitti. Yarın tekrar dene.", 429, "RATE_LIMITED");
    }
  } else {
    guestEntry = await getGuestUsage(getGuestKey(req));
    if (guestEntry.count >= GUEST_LIMIT) {
      throw new AppError("Misafir günlük hak bitti. Giriş yaparak devam edebilirsin.", 429, "RATE_LIMITED");
    }
  }

  const cleanDream = ruya.trim();
  const { prompt, version } = await resolvePrompt({ ruya: cleanDream, tip });
  const ai = await generateInterpretation({ prompt, ruya: cleanDream });

  const yorum = await Yorum.create({
    userId: user?._id,
    ownerKey: user ? undefined : getGuestKey(req),
    ruya: cleanDream,
    tip,
    yorum: ai.text
  });

  if (user) {
    if (user.plan !== "pro") user.gunlukHak = Math.max(0, user.gunlukHak - 1);
    user.toplamYorum += 1;
    await user.save();
  } else if (guestEntry) {
    guestEntry.count += 1;
    await guestEntry.save();
  }

  const promptTokens = Number(ai.usage?.prompt_tokens || 0);
  const completionTokens = Number(ai.usage?.completion_tokens || 0);
  const totalTokens = Number(ai.usage?.total_tokens || (promptTokens + completionTokens));
  const estimatedCostUsd = Number((totalTokens * 0.0000015).toFixed(6));

  await AIUsage.create({
    userId: user?._id,
    yorumId: yorum._id,
    tip,
    model: ai.model,
    promptVersion: version,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd,
    qualityScore: ai.qualityScore
  });

  const kalanHak = user
    ? (user.plan === "pro" ? "sinirsiz" : user.gunlukHak)
    : Math.max(0, GUEST_LIMIT - (guestEntry?.count || 0));

  return {
    yorumId: yorum._id,
    yorum: ai.text,
    kalanHak,
    qualityScore: ai.qualityScore,
    promptVersion: version,
    model: ai.model
  };
}

async function listHistory(userId) {
  return Yorum.find({ userId, deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("ruya tip yorum puan createdAt");
}

async function setRating({ req, user, yorumId, puan }) {
  if (![1, -1, 0].includes(Number(puan))) {
    throw new AppError("Geçersiz puan.", 400, "VALIDATION_ERROR");
  }

  const filter = user
    ? { _id: yorumId, userId: user._id, deletedAt: null }
    : { _id: yorumId, ownerKey: getGuestKey(req), deletedAt: null };

  const updated = await Yorum.findOneAndUpdate(filter, { puan: Number(puan) }, { new: true });
  if (!updated) throw new AppError("Yorum bulunamadı.", 404, "NOT_FOUND");
  return true;
}

async function deleteHistoryItem({ req, user, yorumId }) {
  const filter = user
    ? { _id: yorumId, userId: user._id, deletedAt: null }
    : { _id: yorumId, ownerKey: getGuestKey(req), deletedAt: null };

  const deleted = await Yorum.findOneAndUpdate(filter, { deletedAt: new Date() }, { new: true });
  if (!deleted) throw new AppError("Yorum bulunamadı.", 404, "NOT_FOUND");
  return true;
}

async function userStats(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [buAy, toplam] = await Promise.all([
    Yorum.countDocuments({ userId, deletedAt: null, createdAt: { $gte: monthStart } }),
    Yorum.countDocuments({ userId, deletedAt: null })
  ]);
  return { buAy, toplam };
}

async function attachUserIfAny(req) {
  const token = req.headers.authorization;
  if (!token) return null;
  return null;
}

module.exports = {
  getHak,
  createYorum,
  listHistory,
  setRating,
  deleteHistoryItem,
  userStats,
  syncDailyHak
};
