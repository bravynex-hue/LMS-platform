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
        // Add more robust error handling
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
