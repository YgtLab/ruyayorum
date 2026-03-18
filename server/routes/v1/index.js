const express = require("express");
const authRoutes = require("./auth");
const yorumRoutes = require("./yorum");
const adminRoutes = require("./admin");
const supportRoutes = require("./support");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/yorum", yorumRoutes);
router.use("/admin", adminRoutes);
router.use("/support", supportRoutes);

module.exports = router;
