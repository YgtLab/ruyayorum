const express = require("express");
const { body, query, param } = require("express-validator");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../middleware/asyncHandler");
const AppError = require("../../utils/AppError");
const { ok } = require("../../utils/apiResponse");
const adminService = require("../../services/adminService");
const supportService = require("../../services/supportService");
const { logAudit } = require("../../services/auditService");
const { subscribeTicketEvents, publishTicketEvent } = require("../../services/ticketEventService");
const { upload } = require("../../middleware/upload");

const router = express.Router();

function ensureAdmin(req, _res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Admin yetkisi gerekli.", 403, "FORBIDDEN"));
  }
  return next();
}

router.use(auth, ensureAdmin);

router.get(
  "/istatistik",
  asyncHandler(async (_req, res) => {
    const stats = await adminService.getDashboardStats();
    return ok(res, stats);
  })
);

router.get(
  "/kullanicilar",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Geçersiz sayfa numarası."),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Geçersiz limit.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const result = await adminService.listUsers(req.query);
    return ok(res, result);
  })
);

router.put(
  "/kullanici/:id",
  [
    param("id").isMongoId().withMessage("Geçersiz kullanıcı kimliği."),
    body("plan").optional().isIn(["free", "pro"]).withMessage("Plan free/pro olmalı."),
    body("aktif").optional().isBoolean().withMessage("Aktif alanı boolean olmalı."),
    body("role").optional().isIn(["user", "admin"]).withMessage("Rol user/admin olmalı.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const updated = await adminService.updateUser({
      id: req.params.id,
      plan: req.body.plan,
      aktif: req.body.aktif,
      role: req.body.role
    });

    await logAudit({
      actorUserId: req.user._id,
      action: "ADMIN_UPDATE_USER",
      targetType: "user",
      targetId: req.params.id,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
      meta: {
        plan: req.body.plan,
        aktif: req.body.aktif,
        role: req.body.role
      }
    });

    return ok(res, { user: updated }, "Kullanıcı güncellendi.");
  })
);

router.delete(
  "/kullanici/:id",
  [param("id").isMongoId().withMessage("Geçersiz kullanıcı kimliği.")],
  validate,
  asyncHandler(async (req, res) => {
    await adminService.softDeleteUser({ id: req.params.id, actorId: req.user._id });

    await logAudit({
      actorUserId: req.user._id,
      action: "ADMIN_DELETE_USER",
      targetType: "user",
      targetId: req.params.id,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || ""
    });

    return ok(res, {}, "Kullanıcı silindi.");
  })
);

router.get(
  "/audit",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Geçersiz sayfa numarası."),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Geçersiz limit.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const result = await adminService.listAudit(req.query);
    return ok(res, result);
  })
);

router.get(
  "/kullanici/:id/detay",
  [param("id").isMongoId().withMessage("Geçersiz kullanıcı kimliği.")],
  validate,
  asyncHandler(async (req, res) => {
    const result = await adminService.getUserDetail(req.params.id);
    return ok(res, result);
  })
);

router.get(
  "/tickets",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Geçersiz sayfa numarası."),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Geçersiz limit."),
    query("status").optional().isIn(["open", "closed"]).withMessage("Geçersiz durum."),
    query("priority").optional().isIn(["low", "normal", "high"]).withMessage("Geçersiz öncelik.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const result = await supportService.listAllTickets(req.query);
    return ok(res, result);
  })
);

router.get(
  "/tickets/stream",
  asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const push = (payload) => {
      res.write(`event: ticket\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    push({ type: "connected", ts: Date.now() });
    const unsubscribe = subscribeTicketEvents(push);
    const ping = setInterval(() => {
      res.write(`event: ping\ndata: ${Date.now()}\n\n`);
    }, 25000);

    req.on("close", () => {
      clearInterval(ping);
      unsubscribe();
      res.end();
    });
  })
);

router.get(
  "/tickets/:id",
  [param("id").isMongoId().withMessage("Geçersiz ticket kimliği.")],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await supportService.getTicketAdmin(req.params.id);
    return ok(res, { ticket });
  })
);

router.patch(
  "/tickets/:id",
  [
    param("id").isMongoId().withMessage("Geçersiz ticket kimliği."),
    body("status").optional().isIn(["open", "closed"]).withMessage("Geçersiz durum."),
    body("priority").optional().isIn(["low", "normal", "high"]).withMessage("Geçersiz öncelik.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await supportService.updateTicketAdmin({
      ticketId: req.params.id,
      status: req.body.status,
      priority: req.body.priority
    });

    await logAudit({
      actorUserId: req.user._id,
      action: "ADMIN_UPDATE_TICKET",
      targetType: "ticket",
      targetId: req.params.id,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
      meta: { status: req.body.status, priority: req.body.priority }
    });

    publishTicketEvent({ type: "ticket_updated_admin", ticketId: String(ticket._id), adminId: String(req.user._id) });

    return ok(res, { ticket }, "Ticket güncellendi.");
  })
);

router.post(
  "/tickets/:id/reply",
  upload.array("files", 3),
  [
    param("id").isMongoId().withMessage("Geçersiz ticket kimliği."),
    body("message").trim().notEmpty().withMessage("Mesaj zorunludur.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await supportService.replyTicketAdmin({
      ticketId: req.params.id,
      adminId: req.user._id,
      message: req.body.message,
      attachments: (req.files || []).map((file) => ({
        name: file.originalname || file.filename,
        url: `/uploads/${file.filename}`,
        mime: file.mimetype || "",
        size: Number(file.size || 0)
      }))
    });

    await logAudit({
      actorUserId: req.user._id,
      action: "ADMIN_REPLY_TICKET",
      targetType: "ticket",
      targetId: req.params.id,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || ""
    });

    publishTicketEvent({ type: "ticket_replied_admin", ticketId: String(ticket._id), adminId: String(req.user._id) });

    return ok(res, { ticket }, "Yanıt eklendi.");
  })
);

module.exports = router;
