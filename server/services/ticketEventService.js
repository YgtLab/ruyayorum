const { EventEmitter } = require("events");

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

function publishTicketEvent(payload) {
  emitter.emit("ticket", {
    ts: Date.now(),
    ...payload
  });
}

function subscribeTicketEvents(handler) {
  emitter.on("ticket", handler);
  return () => emitter.off("ticket", handler);
}

module.exports = {
  publishTicketEvent,
  subscribeTicketEvents
};
