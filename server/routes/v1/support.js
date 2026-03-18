const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../middleware/asyncHandler");
const { ok } = require("../../utils/apiResponse");
const supportService = require("../../services/supportService");
const { publishTicketEvent } = require("../../services/ticketEventService");
const { upload } = require("../../middleware/upload");

const router = express.Router();
router.use(auth);

function mapAttachments(req) {
  const files = Array.isArray(req.files) ? req.files : [];
  return files.map((file) => ({
    name: file.originalname || file.filename,
    url: `/uploads/${file.filename}`,
    mime: file.mimetype || "",
    size: Number(file.size || 0)
  }));
}

router.post(
  "/tickets",
  upload.array("files", 3),
  [
    body("subject").trim().notEmpty().withMessage("Konu zorunludur."),
    body("message").trim().notEmpty().withMessage("Mesaj zorunludur."),
    body("category").optional().isIn(["genel", "hesap", "odeme", "teknik"]).withMessage("Geçersiz kategori.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await supportService.createTicket({
      userId: req.user._id,
      subject: req.body.subject,
      message: req.body.message,
      category: req.body.category,
      attachments: mapAttachments(req)
    });
    publishTicketEvent({ type: "ticket_created", ticketId: String(ticket._id), userId: String(req.user._id) });
    return ok(res, { ticket }, "Ticket oluşturuldu.", 201);
  })
);

router.get(
  "/tickets",
  asyncHandler(async (req, res) => {
    const tickets = await supportService.listMyTickets(req.user._id);
    return ok(res, { tickets });
  })
);

router.get(
  "/tickets/:id",
  [param("id").isMongoId().withMessage("Geçersiz ticket kimliği.")],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await supportService.getMyTicket({ userId: req.user._id, ticketId: req.params.id });
    return ok(res, { ticket });
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
    const ticket = await supportService.replyMyTicket({
      userId: req.user._id,
      ticketId: req.params.id,
      message: req.body.message,
      attachments: mapAttachments(req)
    });
    publishTicketEvent({ type: "ticket_replied_user", ticketId: String(ticket._id), userId: String(req.user._id) });
    return ok(res, { ticket }, "Yanıt eklendi.");
  })
);

module.exports = router;
