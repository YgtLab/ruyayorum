const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./db");
const v1Routes = require("./routes/v1");
const errorHandler = require("./middleware/errorHandler");
const { startWorkers } = require("./lib/queue");
const { processEmailJob } = require("./utils/email");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = String(process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const isDev = process.env.NODE_ENV !== "production";
const generalLimitMax = Number(process.env.GENERAL_RATE_LIMIT_MAX || 100);
const authLimitMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 5);

function isLocalOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.isFinite(generalLimitMax) ? generalLimitMax : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Çok fazla istek gönderdin. Lütfen biraz bekle."
    }
  }
});

const authLimiter = (_req, _res, next) => next();
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.isFinite(authLimitMax) ? authLimitMax : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Çok fazla giriş denemesi. Lütfen biraz bekle."
    }
  }
});

app.use(helmet());
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length && allowedOrigins.includes(origin)) return cb(null, true);
    if (!allowedOrigins.length && isDev && isLocalOrigin(origin)) return cb(null, true);
    if (isDev && isLocalOrigin(origin)) return cb(null, true);
    return cb(new Error("CORS engellendi"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(generalLimiter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/v1/auth", isDev ? authLimiter : strictAuthLimiter);
app.use("/api/v1", v1Routes);

app.use("/api/auth", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: {
      code: "API_VERSION_DEPRECATED",
      message: "Bu endpoint artık kullanılmıyor. /api/v1/auth kullanın."
    }
  });
});

app.use("/api/yorum", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: {
      code: "API_VERSION_DEPRECATED",
      message: "Bu endpoint artık kullanılmıyor. /api/v1/yorum kullanın."
    }
  });
});

app.use("/api/admin", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: {
      code: "API_VERSION_DEPRECATED",
      message: "Bu endpoint artık kullanılmıyor. /api/v1/admin kullanın."
    }
  });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/v1/health", (_req, res) => res.json({ ok: true, version: "v1" }));

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Endpoint bulunamadı." });
  return res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use(errorHandler);

connectDB().then(() => {
  startWorkers({
    onEmailJob: async (jobName, payload) => {
      await processEmailJob(jobName, payload);
    }
  });

  app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  });
});
