const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Enhanced rate limiting with IP-based tracking
const createAdvancedRateLimit = (options) => {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    blockDuration = 0, // Additional block time after limit exceeded
  } = options;

  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      // Log suspicious activity
      console.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);
      
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });

  return limiter;
};

// Brute force protection for authentication - optimized for better UX
const bruteForceProtection = createAdvancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes (increased for better UX)
  message: "Too many login attempts. Please try again in 15 minutes.",
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Registration protection
const registrationProtection = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: "Too many registration attempts. Please try again later.",
});

// Contact form protection
const contactFormProtection = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour
  message: "Too many contact form submissions. Please try again later.",
});

// Password reset protection
const passwordResetProtection = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: "Too many password reset attempts. Please try again later.",
});

// Optimized input sanitization - only trim, don't escape (mongo-sanitize handles injection)
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Only trim - validator.escape is expensive and unnecessary with mongo-sanitize
        sanitized[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// XSS Protection middleware
const xssProtection = (req, res, next) => {
  // Set security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// CSRF Protection (for forms)
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Check for CSRF token in headers or body
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};

// Generate CSRF token
const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Password strength validation
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNoCommonPatterns = !/(123|abc|password|qwerty|admin)/i.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasNoCommonPatterns,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      hasNoCommonPatterns,
    },
    score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, hasNoCommonPatterns].filter(Boolean).length,
  };
};

// Email validation with additional checks
const validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  const normalizedEmail = validator.normalizeEmail(email);
  if (!normalizedEmail) {
    return { isValid: false, message: "Invalid email address" };
  }

  // Check for disposable email domains
  const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
  const domain = normalizedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: "Disposable email addresses are not allowed" };
  }

  return { isValid: true, normalizedEmail };
};

// IP-based blocking for suspicious activity
const suspiciousIPs = new Map();

const checkSuspiciousIP = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (suspiciousIPs.has(ip)) {
    const data = suspiciousIPs.get(ip);
    if (now - data.lastSeen < data.blockDuration) {
      return res.status(403).json({
        success: false,
        message: "Access temporarily blocked due to suspicious activity",
      });
    }
    // Remove expired blocks
    suspiciousIPs.delete(ip);
  }
  
  next();
};

const markSuspiciousIP = (ip, blockDuration = 60 * 60 * 1000) => {
  suspiciousIPs.set(ip, {
    lastSeen: Date.now(),
    blockDuration,
  });
};

// Security logger object with different log levels
const securityLogger = {
  info: (message, data = {}) => {
    console.log(`[SECURITY-INFO] ${message}`, data);
  },
  warn: (message, data = {}) => {
    console.warn(`[SECURITY-WARN] ${message}`, data);
  },
  error: (message, data = {}) => {
    console.error(`[SECURITY-ERROR] ${message}`, data);
  }
};

// Request logging for security monitoring
const securityLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      duration,
      referer: req.headers.referer,
    };

    // Avoid flagging expected long-running requests (media, certificate generation) as suspicious
    const isMedia = req.url.includes('/media/') || req.url.includes('/upload');
    const isCertificate = req.url.includes('/certificate/');
    const shouldSkipDuration = isMedia || isCertificate;
    
    // Don't flag 404s as suspicious - they're usually just incorrect URLs or crawlers
    const is404 = res.statusCode === 404;
    
    // Only log actual errors (500s) or slow requests, not 404s or client errors
    if ((res.statusCode >= 500 || (duration > 5000 && !shouldSkipDuration)) && !is404) {
      securityLogger.warn('Suspicious activity detected', logData);
    }
  });

  next();
};

// Content Security Policy
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    // Allow Cloudinary and HTTPS media (videos, audio)
    mediaSrc: ["'self'", "https://res.cloudinary.com", "https://*.cloudinary.com", "blob:", "data:"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },
};

module.exports = {
  createAdvancedRateLimit,
  bruteForceProtection,
  registrationProtection,
  contactFormProtection,
  passwordResetProtection,
  sanitizeInput,
  xssProtection,
  csrfProtection,
  generateCSRFToken,
  validatePasswordStrength,
  validateEmail,
  checkSuspiciousIP,
  markSuspiciousIP,
  securityLogger,
  securityLoggerMiddleware,
  cspOptions,
};
