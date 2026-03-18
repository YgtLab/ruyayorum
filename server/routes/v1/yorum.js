const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../../middleware/auth");
const optionalAuth = require("../../middleware/optionalAuth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../middleware/asyncHandler");
const AppError = require("../../utils/AppError");
const { ok } = require("../../utils/apiResponse");
const yorumService = require("../../services/yorumService");

const router = express.Router();

router.get(
  "/hak",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const result = await yorumService.getHak(req, req.user);
    return ok(res, result);
  })
);

router.get(
  "/istatistik",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return ok(res, { buAy: 0, toplam: 0 });
    }

    const stats = await yorumService.userStats(req.user._id);
    return ok(res, stats);
  })
);

router.post(
  "/",
  optionalAuth,
  [
    body("ruya").isString().withMessage("Rüya metni zorunludur."),
    body("tip").isIn(["psikolojik", "dini"]).withMessage("Geçersiz yorum tipi.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const result = await yorumService.createYorum({
      req,
      user: req.user,
      ruya: req.body.ruya,
      tip: req.body.tip
    });

    return ok(res, result, "Yorum üretildi.");
  })
);

router.get(
  "/gecmis",
  auth,
  asyncHandler(async (req, res) => {
    const yorumlar = await yorumService.listHistory(req.user._id);
    return ok(res, { yorumlar });
  })
);

router.patch(
  "/:id/puan",
  optionalAuth,
  [
    param("id").isMongoId().withMessage("Geçersiz yorum kimliği."),
    body("puan").isInt({ min: -1, max: 1 }).withMessage("Geçersiz puan.")
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (!req.user && !req.headers.cookie) {
      throw new AppError("Puanlama için oturum veya cihaz kimliği gerekli.", 401, "UNAUTHORIZED");
    }

    await yorumService.setRating({
      req,
      user: req.user,
      yorumId: req.params.id,
      puan: Number(req.body.puan)
    });

    return ok(res, {}, "Puan kaydedildi.");
  })
);

router.delete(
  "/:id",
  optionalAuth,
  [param("id").isMongoId().withMessage("Geçersiz yorum kimliği.")],
  validate,
  asyncHandler(async (req, res) => {
    await yorumService.deleteHistoryItem({
      req,
      user: req.user,
      yorumId: req.params.id
    });

    return ok(res, {}, "Yorum silindi.");
  })
);

module.exports = router;
