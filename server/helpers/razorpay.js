const Razorpay = require("razorpay");

function assertRazorpayConfigured() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.");
    throw new Error("Payment gateway not configured. Please contact administrator.");
  }
}

function getRazorpayInstance() {
  assertRazorpayConfigured();
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = { getRazorpayInstance };


