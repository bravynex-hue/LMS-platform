const express = require("express");
const { registerUser, loginUser } = require("../../controllers/auth-controller/index");
const { initiatePasswordReset, verifyOTPAndResetPassword } = require("../../controllers/auth-controller/forgot-password-controller");
const { strictAuthLimiter, moderateActionLimiter } = require("../../middleware/rate-limiters");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const router = express.Router();

// Removed GET / to allow SPA route /auth to render client

router.post("/register", moderateActionLimiter, registerUser);
router.post("/login", strictAuthLimiter, loginUser);
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
});

// Add new forgot password routes
router.post("/forgot-password", moderateActionLimiter, initiatePasswordReset);
router.post("/reset-password", moderateActionLimiter, verifyOTPAndResetPassword);

module.exports = router;
