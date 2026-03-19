const express = require("express");
const { registerUser, loginUser } = require("../../controllers/auth-controller/index");
const { initiatePasswordReset, verifyOTPAndResetPassword } = require("../../controllers/auth-controller/forgot-password-controller");
const { strictAuthLimiter, moderateActionLimiter } = require("../../middleware/rate-limiters");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const passport = require("../../config/passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "";
const getFrontendBase = () => FRONTEND_URL.replace(/\/$/, "");

// Removed GET / to allow SPA route /auth to render client

router.post("/register", moderateActionLimiter, registerUser);
router.post("/login", strictAuthLimiter, loginUser);
router.get("/check-auth", authenticateMiddleware, async (req, res) => {
  try {
    const User = require("../../models/User");
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      data: {
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          studentId: user.studentId,
          guardianDetails: user.guardianDetails,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add new forgot password routes
router.post("/forgot-password", moderateActionLimiter, initiatePasswordReset);
router.post("/reset-password", moderateActionLimiter, verifyOTPAndResetPassword);

// OAuth Routes
router.get("/github", (req, res, next) => {
  const mode = req.query.mode || 'signin';
  passport.authenticate("github", { 
    scope: ["user:email"],
    state: mode
  })(req, res, next);
});
router.get(
  "/github/callback",
  (req, res, next) => {
    passport.authenticate("github", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        const base = getFrontendBase();
        if (info && info.message === 'not_registered') {
          return res.redirect(`${base}/signup?error=not_registered`);
        }
        return res.redirect(`${base}/signin?error=github_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        studentId: user.studentId,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET || "JWT_SECRET",
      { expiresIn: "120m" }
    );
    
    // Redirect to frontend with token
    const mode = req.query.state || 'signin';
    if (mode === 'signup') {
      const base = getFrontendBase();
      if (user.isNewUser) {
        res.redirect(`${base}/auth/success?token=${token}&isNewUser=true`);
      } else {
        res.redirect(`${base}/auth/success?token=${token}&alreadyRegistered=true`);
      }
    } else {
      const base = getFrontendBase();
      res.redirect(`${base}/auth/success?token=${token}&isNewUser=false`);
    }
  }
);

module.exports = router;
