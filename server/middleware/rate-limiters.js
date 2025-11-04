const rateLimit = require("express-rate-limit");

function buildJsonLimiter(options) {
  const {
    windowMs,
    max,
    message = "Too many attempts. Please try again later.",
    keyGenerator,
    skip,
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skip,
    handler: (req, res /*, next */) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
}

// Strict for login / OTP / verify actions
const strictAuthLimiter = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, please try again in 15 minutes.",
});

// Moderate for registration / reset-password
const moderateActionLimiter = buildJsonLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later.",
});

// General API limiter (less strict)
const generalApiLimiter = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

module.exports = {
  buildJsonLimiter,
  strictAuthLimiter,
  moderateActionLimiter,
  generalApiLimiter,
};


