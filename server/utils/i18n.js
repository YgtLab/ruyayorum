const trToEn = {
  "Sunucu hatası": "Server error",
  "Çok fazla istek gönderdin. Lütfen biraz bekle.": "Too many requests. Please try again later.",
  "Çok fazla giriş denemesi. Lütfen biraz bekle.": "Too many login attempts. Please wait and try again.",
  "Bu endpoint artık kullanılmıyor. /api/v1/auth kullanın.": "This endpoint is deprecated. Please use /api/v1/auth.",
  "Bu endpoint artık kullanılmıyor. /api/v1/yorum kullanın.": "This endpoint is deprecated. Please use /api/v1/yorum.",
  "Bu endpoint artık kullanılmıyor. /api/v1/admin kullanın.": "This endpoint is deprecated. Please use /api/v1/admin.",
  "Endpoint bulunamadı.": "Endpoint not found.",
  "CORS engellendi": "CORS blocked"
};

function resolveLang(req) {
  const direct = (req.headers["x-lang"] || req.query?.lang || req.body?.lang || "").toString().toLowerCase();
  if (direct === "en" || direct === "tr") return direct;

  const accept = (req.headers["accept-language"] || "").toString().toLowerCase();
  if (accept.startsWith("en")) return "en";
  return "tr";
}

function t(req, trMessage) {
  const lang = resolveLang(req);
  if (lang === "tr") return trMessage;
  return trToEn[trMessage] || trMessage;
}

module.exports = { resolveLang, t };
