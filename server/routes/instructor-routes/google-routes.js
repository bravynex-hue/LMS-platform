const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const { getGoogleAuthUrl, handleGoogleCallback, disconnectGoogle, getGoogleStatus } = require("../../controllers/instructor-controller/google-controller");

const router = express.Router();

// Public callback (uses state validation instead of auth)
router.get("/callback", handleGoogleCallback);

// Authenticated endpoints
router.get("/auth-url", authenticate, getGoogleAuthUrl);
router.post("/disconnect", authenticate, disconnectGoogle);
router.get("/status", authenticate, getGoogleStatus);

module.exports = router;


