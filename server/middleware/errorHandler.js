function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Sunucu hatası",
      details: err.details || null
    }
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.error.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorHandler;
