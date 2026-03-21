require("dotenv").config();

// Initialize background workers (BullMQ)
require("./workers/email-worker");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("./config/redis");
const http = require("http");
const { Server } = require("socket.io");
const { initializeSocket } = require("./socket");
const { generalApiLimiter } = require("./middleware/rate-limiters");
const { cspOptions, securityLoggerMiddleware } = require("./middleware/security-middleware");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const passport = require("passport");

// ----------------- Routes -----------------
const authRoutes = require("./routes/auth-routes/index");
const secureAuthRoutes = require("./routes/secure-auth-routes");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const instructorAnalyticsRoutes = require("./routes/instructor-routes/analytics-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const studentAnalyticsRoutes = require("./routes/student-routes/analytics-routes");
const notifyRoutes = require("./routes/notify-routes");
const secureInstructorRoutes = require("./routes/instructor-routes/secure-instructor-routes");
const studentMessagingRoutes = require("./routes/student-routes/messaging-routes");
const instructorMessagingRoutes = require("./routes/instructor-routes/messaging-routes");
const publicRoutes = require("./routes/public-routes");

const adminUserRoutes = require("./routes/admin-routes/user-routes");
const adminCourseRoutes = require("./routes/admin-routes/course-routes");
const adminPaymentRoutes = require("./routes/admin-routes/payment-routes");
const adminFeedbackRoutes = require("./routes/admin-routes/feedback-routes");
const adminCertificateRoutes = require("./routes/admin-routes/certificate-routes");
const feedbackRoutes = require("./routes/feedback-routes");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment");
  process.exit(1);
}

// ----------------- Request Logging -----------------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// ----------------- CORS (must be before maintenance mode) -----------------
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...CORS_ORIGINS,
  "https://bravynex.in",
  "https://www.bravynex.in",
  // Allow any Render app subdomain for both client and server if configured
  "https://*.onrender.com",
];

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => {
      if (o.includes("*")) {
        const escaped = o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, ".*");
        const regex = new RegExp("^" + escaped + "$");
        return regex.test(origin);
      }
      return origin === o;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With", "Accept"],
  credentials: true,
};

// Apply CORS middleware first (needed for preflight requests)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// ----------------- Maintenance Mode (after CORS) -----------------
// Robust check for maintenance mode - handles true, false, undefined, empty string
const getMaintenanceMode = () => {
  const mode = process.env.MAINTENANCE_MODE;
  if (!mode) return false; // Not set or empty
  return String(mode).toLowerCase().trim() === "true";
};

const IS_MAINTENANCE_MODE = getMaintenanceMode();

// Log maintenance mode status on startup
console.log(`🔧 Maintenance Mode: ${IS_MAINTENANCE_MODE ? "ENABLED" : "DISABLED"}`);

// Maintenance mode middleware - API-only (UI handled by React client)
app.use((req, res, next) => {
  // If maintenance mode is OFF, proceed normally
  if (!IS_MAINTENANCE_MODE) {
    return next();
  }

  // Allow health check and OPTIONS preflight to proceed normally
  if (req.path === "/health" || req.method === "OPTIONS") {
    return next();
  }

  const apiPrefixes = [
    "/public/", "/auth/", "/secure/", "/media/", "/student/", "/instructor/",
    "/notify/", "/admin/", "/csrf-token"
  ];

  const isApi = apiPrefixes.some(prefix => {
    if (prefix.endsWith('/')) return req.path.startsWith(prefix);
    return req.path === prefix;
  });

  if (isApi) {
    // Return JSON 503 for API routes with proper CORS headers
    res.setHeader('Retry-After', '120');
    res.setHeader('Content-Type', 'application/json');
    return res.status(503).json({ 
      success: false, 
      message: 'Service under maintenance. Please try again soon.',
      maintenance: true
    });
  }

  // For non-API routes, let the React SPA load and handle
  return next();
});

// ----------------- Security -----------------
const { directives } = cspOptions;
const dynamicConnectSrc = new Set([...(directives.connectSrc || ["'self'"])]);
const dynamicMediaSrc = new Set([...(directives.mediaSrc || [])]);

CORS_ORIGINS.forEach(o => dynamicConnectSrc.add(o));

dynamicConnectSrc.add("https://*.onrender.com");


dynamicMediaSrc.add("'self'");
dynamicMediaSrc.add("https://res.cloudinary.com");
dynamicMediaSrc.add("https://*.cloudinary.com");
dynamicMediaSrc.add("blob:");
dynamicMediaSrc.add("data:");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...directives,
      connectSrc: Array.from(dynamicConnectSrc),
      mediaSrc: Array.from(dynamicMediaSrc),
      // Disable automatic HTTPS upgrades in development/local IP environments
      upgradeInsecureRequests: null,
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  // Disable HSTS in development to prevent local IP from being forced to HTTPS
  hsts: process.env.NODE_ENV === "production",
}));

// Enable gzip compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9, 6 is default)
}));

app.use(securityLoggerMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize());

// ----------------- Session & Passport -----------------
app.use(session({
  secret: process.env.SESSION_SECRET || "bravynex_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ----------------- Rate limiting -----------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { default: false },
  skip: req => req.path === "/csrf-token" ||
    process.env.NODE_ENV !== "production",
  store: process.env.NODE_ENV === "production"
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:auth:',
      })
    : undefined, // Memory store in dev
});

app.use("/auth", authLimiter);
app.use((req, res, next) => {
  if (req.path === "/csrf-token" || req.path === "/health") return next();
  return generalApiLimiter(req, res, next);
});

// ----------------- CSRF -----------------
const csrfProtection = csrf({
  cookie: { 
    key: "csrfToken", 
    httpOnly: false, 
    sameSite: "lax", 
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    // Check both header and body for CSRF token
    return req.headers['x-csrf-token'] || req.body._csrf;
  }
});

// Apply CSRF protection to all routes except static files, health checks, and auth endpoints
app.use((req, res, next) => {
  // Skip CSRF for static files, health checks, auth endpoints, and CSRF token endpoint
  if (req.path === '/csrf-token' || 
      req.path === '/health' || 
      req.path === '/favicon.ico' ||
      req.path.startsWith('/static/') ||
      req.path.startsWith('/assets/') ||
      // Skip CSRF for public endpoints (no authentication required)
      req.path.startsWith('/public/') ||
      // Skip CSRF for notify contact endpoint (public form submission)
      req.path === '/notify/contact-admin' ||
      // Skip CSRF for authentication endpoints
      req.path === '/auth/login' ||
      req.path === '/auth/register' ||
      req.path === '/auth/google' ||
      req.path === '/auth/forgot-password' ||
      req.path === '/auth/reset-password' ||
      req.path === '/secure/login' ||
      req.path === '/secure/register' ||
      req.path === '/secure/forgot-password' ||
      req.path === '/secure/reset-password' ||
      req.path === '/secure/contact' ||
      // Skip CSRF for course progress endpoints (they handle their own security)
      req.path.startsWith('/student/course-progress/') ||
      // Skip CSRF for media upload endpoints (they handle their own security)
      req.path.startsWith('/media/upload') ||
      req.path.startsWith('/media/bulk-upload') ||
      // Skip CSRF for instructor course endpoints (they handle their own security)
      req.path.startsWith('/instructor/course/') ||
      // Skip CSRF for secure instructor endpoints (bearer auth only)
      req.path.startsWith('/secure/instructor/') ||
      // Skip CSRF for student order endpoints (they handle their own security)
      req.path.startsWith('/student/order/') ||
      // Skip CSRF for admin endpoints (they use bearer token authentication)
      req.path.startsWith('/admin/') ||
      // Skip CSRF for feedback endpoints (they use bearer token authentication)
      req.path.startsWith('/feedback') ||
      // Skip CSRF for messaging routes (bearer auth only)
      req.path.startsWith('/student/messages/') ||
      req.path.startsWith('/instructor/messages/')) {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.get("/csrf-token", (req, res) => {
  try {
    const token = typeof req.csrfToken === "function" ? req.csrfToken() : null;
    res.status(200).json({ 
      csrfToken: token,
      success: true 
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate CSRF token" 
    });
  }
});

// ----------------- Database -----------------
// Optimized MongoDB connection with pooling for better performance
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2,  // Maintain at least 2 socket connections
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log("✅ MongoDB connected with optimized pooling"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ----------------- API Routes -----------------
console.log("🛠️  Registering API routes...");
app.use("/public", publicRoutes); 
app.use("/auth", authRoutes);
app.use("/secure", secureAuthRoutes);
console.log("✅ Main Auth routes registered (/auth, /secure)");
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor/analytics", instructorAnalyticsRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/analytics", studentAnalyticsRoutes);
app.use("/notify", notifyRoutes);
app.use("/secure/instructor", secureInstructorRoutes);
app.use("/student/messages", studentMessagingRoutes);
app.use("/instructor/messages", instructorMessagingRoutes);

app.use("/admin/users", adminUserRoutes);
app.use("/admin/courses", adminCourseRoutes);
app.use("/admin/payments", adminPaymentRoutes);
app.use("/admin/feedback", adminFeedbackRoutes);
app.use("/admin/certificates", adminCertificateRoutes);
app.use("/feedback", feedbackRoutes);

app.get("/favicon.ico", (req, res) => res.sendStatus(204));
app.get("/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.status(200).json({ 
    status: IS_MAINTENANCE_MODE ? "MAINTENANCE" : "OK", 
    timestamp: new Date().toISOString(), 
    environment: process.env.NODE_ENV || "development",
    maintenance: IS_MAINTENANCE_MODE
  });
});
console.log("✅ Health route registered (/health)");

// Test endpoint to verify CSRF protection is working
app.post("/test-csrf", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "CSRF protection is working correctly",
    timestamp: new Date().toISOString()
  });
});

// ----------------- Serve React SPA -----------------
const clientDistPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log("✅ Serving static files from:", clientDistPath);
} else {
  console.warn("⚠️ Client dist directory not found at:", clientDistPath);
}

// ----------------- Global Error Handler (must be before catch-all) -----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// ----------------- SPA Catch-all Route (must be last) -----------------
app.get("*", (req, res) => {
  // Only treat as API if it's an actual API path that wasn't matched by routes above
  // This prevents frontend routes from being blocked
  const apiPrefixes = [
    "/public/", "/auth/", "/secure/", "/media/", "/student/", "/instructor/",
    "/notify/", "/csrf-token", "/health", "/favicon.ico"
  ];

  // Check if it's an API route (with trailing slash to avoid blocking /auth frontend route)
  const isApi = apiPrefixes.some(prefix => {
    if (prefix.endsWith('/')) {
      return req.path.startsWith(prefix);
    }
    return req.path === prefix;
  });
  
  if (isApi) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found"
    });
  }

  const indexPath = path.join(__dirname, "..", "client", "dist", "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at:', indexPath);
    return res.status(500).json({
      success: false,
      message: "Frontend build not found. Please ensure the client is built.",
      path: indexPath
    });
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ success: false, message: "Error serving frontend" });
    }
  });
});

// ----------------- Start -----------------
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
});



