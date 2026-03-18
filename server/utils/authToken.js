const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const ACCESS_COOKIE = "ry_access";
const REFRESH_COOKIE = "ry_refresh";

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return acc;
      const key = decodeURIComponent(part.slice(0, idx));
      const value = decodeURIComponent(part.slice(idx + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);

  const cookies = parseCookies(req.headers.cookie || "");
  if (cookies[ACCESS_COOKIE]) return cookies[ACCESS_COOKIE];
  if (cookies.ruyayorum_token) return cookies.ruyayorum_token;

  return null;
}

function extractRefreshToken(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[REFRESH_COOKIE] || null;
}

function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
    path: "/"
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/"
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" }
  );
}

function signRefreshToken({ userId, deviceId }) {
  return jwt.sign(
    { id: userId, did: deviceId, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function createDeviceId() {
  return uuidv4();
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  parseCookies,
  extractToken,
  extractRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  createDeviceId
};
