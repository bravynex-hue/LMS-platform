const express = require("express");
const { 
  secureRegisterUser, 
  secureLoginUser, 
  secureInitiatePasswordReset, 
  secureVerifyPasswordReset 
} = require("../controllers/auth-controller/secure-auth-controller");
const { secureContactSubmission } = require("../controllers/secure-contact-controller");
const { 
  bruteForceProtection, 
  registrationProtection, 
  contactFormProtection, 
  passwordResetProtection,
  sanitizeInput,
  xssProtection,
  securityLoggerMiddleware
} = require("../middleware/security-middleware");
const authenticateMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

// Apply security middleware to all routes
router.use(securityLoggerMiddleware);
router.use(xssProtection);
router.use(sanitizeInput);

// Authentication routes with enhanced security
router.post("/register", registrationProtection, secureRegisterUser);
router.post("/login", bruteForceProtection, secureLoginUser);
router.post("/forgot-password", passwordResetProtection, secureInitiatePasswordReset);
router.post("/reset-password", passwordResetProtection, secureVerifyPasswordReset);

// Contact form route with enhanced security
router.post("/contact", contactFormProtection, secureContactSubmission);

// Auth check route - optimized to return only essential user data
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  // Only return essential fields to reduce payload size
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
    },
  });
});

// Logout route (client-side token removal)
router.post("/logout", (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
