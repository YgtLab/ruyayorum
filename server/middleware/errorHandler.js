const { t } = require("../utils/i18n");

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const baseMessage = err.message || "Sunucu hatası";
  const payload = {
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: t(req, baseMessage),
      details: err.details || null
    }
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.error.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorHandler;
