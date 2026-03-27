const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");

function buildJsonLimiter(options) {
  const {
    windowMs,
    max,
    message = "Too many attempts. Please try again later.",
    keyGenerator,
    skip = () => process.env.NODE_ENV !== "production", // Completely skip rate limiting in dev
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    keyGenerator,
    skip,
    store: process.env.NODE_ENV === "production" 
      ? new RedisStore({
          sendCommand: (...args) => redisClient.call(...args),
          prefix: 'rl:gen:',
        })
      : undefined, // Uses memory store in dev
    handler: (req, res /*, next */) => {
      // Allow unrestricted access in development
      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({ success: true, message: "Rate limit bypassed in DEV" }); // Only used if skip fails
      }
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
  max: 25,
  message: "Too many attempts, please try again in 15 minutes.",
});

// Moderate for registration / reset-password / course actions
const moderateActionLimiter = buildJsonLimiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

// General API limiter (less strict)
const generalApiLimiter = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 1000 : 5000, // Higher in dev
});

module.exports = {
  buildJsonLimiter,
  strictAuthLimiter,
  moderateActionLimiter,
  generalApiLimiter,
};


