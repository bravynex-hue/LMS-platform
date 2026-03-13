const { Queue } = require('bullmq');
const redisClient = require('./redis');

const isProd = process.env.NODE_ENV === "production";
const enableWorkers = process.env.ENABLE_WORKERS === "true";

// Centralized queue configuration
const defaultJobOptions = {
  removeOnComplete: true,
  removeOnFail: false,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

let emailQueue, certificateQueue;

if (isProd || enableWorkers) {
  // Create a queue for emails
  emailQueue = new Queue('email-queue', {
    connection: redisClient,
    defaultJobOptions,
  });

  // Create a queue for PDF certificates
  certificateQueue = new Queue('certificate-queue', {
    connection: redisClient,
    defaultJobOptions,
  });
} else {
  // Mocks for development
  const mockQueue = {
    add: async (name, data) => {
      console.log(`[Mock Queue] Job added: ${name}`);
      return { id: 'mock-id' };
    },
    on: () => {},
  };
  emailQueue = mockQueue;
  certificateQueue = mockQueue;
}

// Helper function to add jobs easily from controllers
const addEmailJob = async (jobName, data) => {
  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_WORKERS !== "true") {
    console.log(`[Queue Mock] skipping email job: ${jobName}`);
    return { id: 'mock-id' };
  }
  try {
    return await emailQueue.add(jobName, data);
  } catch (err) {
    console.error("❌ Failed to add email job to queue:", err.message);
    return null;
  }
};

const addCertificateJob = async (jobName, data) => {
  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_WORKERS !== "true") {
    console.log(`[Queue Mock] skipping certificate job: ${jobName}`);
    return { id: 'mock-id' };
  }
  try {
    return await certificateQueue.add(jobName, data);
  } catch (err) {
    console.error("❌ Failed to add certificate job to queue:", err.message);
    return null;
  }
};

module.exports = {
  emailQueue,
  certificateQueue,
  addEmailJob,
  addCertificateJob,
};
