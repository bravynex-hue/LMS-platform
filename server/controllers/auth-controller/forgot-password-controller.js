const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { sendOTPEmail } = require("../../helpers/resend-mailer");

// Store OTPs in memory (in production, use Redis or similar)
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = validator.normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ userEmail: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found. Please check your email address or register for a new account.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp and email
    otpStore.set(normalizedEmail, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send OTP email
    try {
      await sendOTPEmail({ email: normalizedEmail, otp });
    } catch (emailError) {
      // Remove OTP from store if email fails
      otpStore.delete(normalizedEmail);
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please verify your email address is valid and try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Password reset initiation error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request. Please try again later.",
    });
  }
};

const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = validator.normalizeEmail(email);

    // Validate inputs
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol",
      });
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(normalizedEmail);
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request an OTP first from the forgot password page.",
      });
    }

    // Check OTP expiry (10 minutes)
    if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      
      // If more than 3 failed attempts, invalidate OTP
      if (otpData.attempts >= 3) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 3 - otpData.attempts
      });
    }

    // Update password
    const user = await User.findOne({ userEmail: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear OTP
    otpStore.delete(normalizedEmail);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  initiatePasswordReset,
  verifyOTPAndResetPassword
};