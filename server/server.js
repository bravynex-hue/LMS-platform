require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { generalApiLimiter } = require("./middleware/rate-limiters");
const { cspOptions, securityLoggerMiddleware } = require("./middleware/security-middleware");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const path = require("path");

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
const instructorLiveSessionRoutes = require("./routes/instructor-routes/live-session-routes");
const studentLiveSessionRoutes = require("./routes/student-routes/live-session-routes");
const instructorInternshipRoutes = require("./routes/instructor-routes/internship-routes");
const instructorQuizRoutes = require("./routes/instructor-routes/quiz-routes");
const studentQuizRoutes = require("./routes/student-routes/quiz-routes");
const publicRoutes = require("./routes/public-routes");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment");
  process.exit(1);
}

// ----------------- CORS -----------------
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...CORS_ORIGINS,
  "https://lms-platform-client.onrender.com",
  "http://localhost:5173",
  // Allow any Render app subdomain for both client and server if configured
  "https://*.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => {
      if (o.includes("*")) {
        const escaped = o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, ".*");
        const regex = new RegExp("^" + escaped + "$");
        return regex.test(origin);
      }
      return origin === o;
    });
    return isAllowed ? callback(null, true) : callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With", "Accept"],
  credentials: true,
}));

app.options("*", cors()); // preflight

// ----------------- Security -----------------
const { directives } = cspOptions;
const dynamicConnectSrc = new Set([...(directives.connectSrc || ["'self'"])]);
const dynamicMediaSrc = new Set([...(directives.mediaSrc || [])]);

CORS_ORIGINS.forEach(o => dynamicConnectSrc.add(o));
dynamicConnectSrc.add("http://localhost:5000");
dynamicConnectSrc.add("https://localhost:5000");
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
    }
  },
  crossOriginEmbedderPolicy: false,
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

// ----------------- Rate limiting -----------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.path === "/csrf-token",
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
      req.path === '/auth/forgot-password' ||
      req.path === '/auth/reset-password' ||
      req.path === '/secure/login' ||
      req.path === '/secure/register' ||
      req.path === '/secure/forgot-password' ||
      req.path === '/secure/reset-password' ||
      req.path === '/secure/contact' ||
      // Skip CSRF for course progress endpoints (they handle their own security)
      req.path.startsWith('/student/course-progress/') ||
      req.path.startsWith('/student/course-progress/certificate/') ||
      req.path.startsWith('/student/live-sessions/') ||
      // Skip CSRF for media upload endpoints (they handle their own security)
      req.path.startsWith('/media/upload') ||
      req.path.startsWith('/media/bulk-upload') ||
      // Skip CSRF for instructor course endpoints (they handle their own security)
      req.path.startsWith('/instructor/course/') ||
      req.path.startsWith('/instructor/live-sessions/') ||
      req.path.startsWith('/instructor/quizzes/') ||
      // Skip CSRF for secure instructor endpoints (bearer auth only)
      req.path.startsWith('/secure/instructor/') ||
      // Skip CSRF for student order endpoints (they handle their own security)
      req.path.startsWith('/student/order/') ||
      req.path.startsWith('/student/quizzes/')) {
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
app.use("/public", publicRoutes); // Public routes - no auth required
app.use("/auth", authRoutes);
app.use("/secure", secureAuthRoutes);
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
app.use("/instructor/live-sessions", instructorLiveSessionRoutes);
app.use("/student/live-sessions", studentLiveSessionRoutes);
app.use("/instructor/internships", instructorInternshipRoutes);
app.use("/instructor/quizzes", instructorQuizRoutes);
app.use("/student/quizzes", studentQuizRoutes);

app.get("/favicon.ico", (req, res) => res.sendStatus(204));
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || "development" });
});

// Test endpoint to verify CSRF protection is working
app.post("/test-csrf", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "CSRF protection is working correctly",
    timestamp: new Date().toISOString()
  });
});

// ----------------- Serve React SPA -----------------
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// ----------------- Global Error Handler (must be before catch-all) -----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// ----------------- Static Files -----------------
// Serve static files from client dist directory
const fs = require('fs');
const clientDistPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log('✅ Serving static files from:', clientDistPath);
} else {
  console.warn('⚠️ Client dist directory not found at:', clientDistPath);
}

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

