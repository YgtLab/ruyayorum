const AppError = require("../utils/AppError");

const MODEL_CANDIDATES = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile"
];

const BLOCKED_PATTERNS = [
  /kendine zarar/i,
  /intihar/i,
  /nefret/i,
  /şiddet/i
];

function moderateDream(ruya) {
  const risky = BLOCKED_PATTERNS.some((p) => p.test(ruya));
  if (!risky) return;
  throw new AppError(
    "Rüya metni güvenlik filtrelerine takıldı. Lütfen metni daha güvenli biçimde yaz.",
    400,
    "MODERATION_BLOCKED"
  );
}

function scoreQuality(text) {
  let score = 0;
  if (text.length > 250) score += 40;
  if (/Ana Sembol|Rüyanın Anlamı/i.test(text)) score += 20;
  if (/Mesaj/i.test(text)) score += 20;
  if (/\n/.test(text)) score += 20;
  return Math.min(100, score);
}

async function callGroq({ prompt, model }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.95
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "AI API hatası");
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Yorum üretilemedi");

  return {
    text,
    usage: data?.usage || {},
    model
  };
}

async function generateInterpretation({ prompt, ruya }) {
  moderateDream(ruya);

  let lastError = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      const result = await callGroq({ prompt, model });
      return {
        ...result,
        qualityScore: scoreQuality(result.text)
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw new AppError(lastError?.message || "Yorum üretilemedi", 502, "AI_PROVIDER_ERROR");
}

module.exports = { generateInterpretation };
