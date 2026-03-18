const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  ad: { type: String, required: true, trim: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  gunlukHak: { type: Number, default: 2 },
  hakSifirlamaTarihi: { type: Date, default: Date.now },
  toplamYorum: { type: Number, default: 0 },
  emailDogrulandi: { type: Boolean, default: false },
  emailToken: String,
  resetToken: String,
  resetTokenExpire: Date,
  aktif: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  lastLoginIp: { type: String, default: "" },
  lastLoginUa: { type: String, default: "" },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: "" },
  twoFactorTempSecret: { type: String, default: "" },
  twoFactorRecoveryCodes: { type: [String], default: [] },
  twoFactorRecoveryUpdatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null, index: true }
});

userSchema.index({ plan: 1, role: 1 });

userSchema.pre("save", async function preSave() {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
