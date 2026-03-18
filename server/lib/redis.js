const Redis = require("ioredis");

let redis = null;

function getRedis() {
  if (redis) return redis;
  if (!process.env.REDIS_URL) return null;

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true
  });

  redis.on("error", (err) => {
    console.error("Redis hata:", err.message);
  });

  redis.connect().catch((err) => {
    console.error("Redis bağlantı hatası:", err.message);
  });

  return redis;
}

module.exports = { getRedis };
