const Ticket = require("../models/Ticket");
const AppError = require("../utils/AppError");

async function createTicket({ userId, subject, message, category = "genel", attachments = [] }) {
  const cleanSubject = String(subject || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!cleanSubject) throw new AppError("Konu zorunludur.", 400, "VALIDATION_ERROR");
  if (!cleanMessage) throw new AppError("Mesaj zorunludur.", 400, "VALIDATION_ERROR");

  const ticket = await Ticket.create({
    userId,
    subject: cleanSubject,
    category,
    messages: [{ from: "user", userId, message: cleanMessage, attachments }]
  });

  return ticket;
}

async function listMyTickets(userId) {
  return Ticket.find({ userId }).sort({ updatedAt: -1 }).limit(50);
}

async function getMyTicket({ userId, ticketId }) {
  const ticket = await Ticket.findOne({ _id: ticketId, userId });
  if (!ticket) throw new AppError("Ticket bulunamadı.", 404, "NOT_FOUND");
  return ticket;
}

async function replyMyTicket({ userId, ticketId, message, attachments = [] }) {
  const cleanMessage = String(message || "").trim();
  if (!cleanMessage) throw new AppError("Mesaj zorunludur.", 400, "VALIDATION_ERROR");

  const ticket = await Ticket.findOne({ _id: ticketId, userId });
  if (!ticket) throw new AppError("Ticket bulunamadı.", 404, "NOT_FOUND");

  ticket.messages.push({ from: "user", userId, message: cleanMessage, attachments });
  ticket.updatedAt = new Date();
  await ticket.save();
  return ticket;
}

async function listAllTickets({ page = 1, limit = 20, status, priority, q = "" }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const keyword = String(q || "").trim();

  const filter = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(keyword ? { subject: { $regex: keyword, $options: "i" } } : {})
  };

  const [toplam, tickets] = await Promise.all([
    Ticket.countDocuments(filter),
    Ticket.find(filter)
      .populate("userId", "email ad")
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return { page: safePage, limit: safeLimit, toplam, tickets };
}

async function getTicketAdmin(ticketId) {
  const ticket = await Ticket.findById(ticketId).populate("userId", "email ad plan role");
  if (!ticket) throw new AppError("Ticket bulunamadı.", 404, "NOT_FOUND");
  return ticket;
}

async function updateTicketAdmin({ ticketId, status, priority }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError("Ticket bulunamadı.", 404, "NOT_FOUND");

  if (status && ["open", "closed"].includes(status)) ticket.status = status;
  if (priority && ["low", "normal", "high"].includes(priority)) ticket.priority = priority;

  ticket.updatedAt = new Date();
  await ticket.save();
  return ticket;
}

async function replyTicketAdmin({ ticketId, adminId, message, attachments = [] }) {
  const cleanMessage = String(message || "").trim();
  if (!cleanMessage) throw new AppError("Mesaj zorunludur.", 400, "VALIDATION_ERROR");

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError("Ticket bulunamadı.", 404, "NOT_FOUND");

  ticket.messages.push({ from: "admin", userId: adminId, message: cleanMessage, attachments });
  ticket.updatedAt = new Date();
  await ticket.save();
  return ticket;
}

module.exports = {
  createTicket,
  listMyTickets,
  getMyTicket,
  replyMyTicket,
  listAllTickets,
  getTicketAdmin,
  updateTicketAdmin,
  replyTicketAdmin
};
