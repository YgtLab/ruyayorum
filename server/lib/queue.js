const { Queue, Worker } = require("bullmq");
const { getRedis } = require("./redis");

let emailQueue = null;

function getEmailQueue() {
  if (emailQueue) return emailQueue;
  const redis = getRedis();
  if (!redis) return null;

  emailQueue = new Queue("email", { connection: redis });
  return emailQueue;
}

function startWorkers({ onEmailJob }) {
  const redis = getRedis();
  if (!redis || typeof onEmailJob !== "function") return null;

  const worker = new Worker(
    "email",
    async (job) => {
      await onEmailJob(job.name, job.data);
    },
    { connection: redis }
  );

  worker.on("failed", (job, err) => {
    console.error("Email job fail:", job?.id, err.message);
  });

  return { emailWorker: worker };
}

module.exports = { getEmailQueue, startWorkers };
