const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema({
  from: { type: String, enum: ["user", "admin"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  message: { type: String, required: true, trim: true },
  attachments: {
    type: [{
      name: { type: String, default: "" },
      url: { type: String, default: "" },
      mime: { type: String, default: "" },
      size: { type: Number, default: 0 }
    }],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, required: true, trim: true },
  category: { type: String, enum: ["genel", "hesap", "odeme", "teknik"], default: "genel", index: true },
  status: { type: String, enum: ["open", "closed"], default: "open", index: true },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal", index: true },
  messages: { type: [ticketMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

ticketSchema.pre("save", function preSave(next) {
  this.updatedAt = new Date();
  next();
});

ticketSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Ticket", ticketSchema);
