const { Worker } = require('bullmq');
const redisClient = require('../config/redis');

// Example: Import your mailer here
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let emailWorker;

// Only initialize worker if Redis is likely available or we are in production
if (process.env.NODE_ENV === "production" || process.env.ENABLE_WORKERS === "true") {
  try {
    emailWorker = new Worker(
      'email-queue',
      async (job) => {
        // ... (rest of the logic)
        console.log(`[Email Worker] Processing job ${job.id} of type ${job.name}`);

        const { email, subject, body } = job.data;

        try {
          if (job.name === 'sendReceipt') {
            console.log(`Sending receipt to ${email}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`[Email Worker] Receipt sent successfully to ${email}`);
          }

          if (job.name === 'sendWelcomeEmail') {
            console.log(`[Email Worker] Welcome email sent to ${email}`);
          }

        } catch (error) {
          console.error(`[Email Worker] Job ${job.id} failed:`, error);
          throw error;
        }
      },
      { 
        connection: redisClient,
        // === Upstash Free Tier Optimizations ===
        // 1. Reduced Polling: Wait 5 minutes (300 seconds) when the queue is empty 
        //    before making another BZPOPMIN request. By default, it's 5 seconds.
        drainDelay: 300, 
        
        // 2. Reduce EVALSHA commands check: BullMQ checks for stalled jobs.
        //    Default is 30000ms (30s), which burns Upstash free-tier limits.
        //    Increase to 5 minutes (300000ms).
        stalledInterval: 300000,
        
        // 3. Prevent retries of stalled jobs, reduces Redis command overhead
        maxStalledCount: 0,
      }
    );

    emailWorker.on('completed', (job) => {
      console.log(`[Email Worker] Job ${job.id} has completed!`);
    });

    emailWorker.on('failed', (job, err) => {
      console.log(`[Email Worker] Job ${job.id} has failed with ${err.message}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize Email Worker:", err.message);
  }
} else {
  console.log("ℹ️ Skipping Email Worker initialization in development (Request limit avoided)");
}

module.exports = emailWorker;
