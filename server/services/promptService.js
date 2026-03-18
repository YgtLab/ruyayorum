const PromptVersion = require("../models/PromptVersion");
const { buildPrompt } = require("../utils/prompt");

function pickByRollout(items) {
  const total = items.reduce((acc, item) => acc + Math.max(0, item.rollout || 0), 0);
  if (total <= 0) return items[0];

  const point = Math.random() * total;
  let cursor = 0;
  for (const item of items) {
    cursor += Math.max(0, item.rollout || 0);
    if (point <= cursor) return item;
  }
  return items[0];
}

async function resolvePrompt({ ruya, tip }) {
  const active = await PromptVersion.find({ tip, active: true }).sort({ createdAt: -1 });
  if (!active.length) {
    return { prompt: buildPrompt(ruya, tip), version: "default" };
  }

  const selected = pickByRollout(active);
  const prompt = `${selected.content}\n\nKullanıcı Rüyası:\n${ruya}`;
  return { prompt, version: selected.version };
}

module.exports = { resolvePrompt };
