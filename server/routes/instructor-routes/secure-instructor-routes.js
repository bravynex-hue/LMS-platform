const express = require("express");
const multer = require("multer");
const authenticate = require("../../middleware/auth-middleware");
// const { csrfProtection } = require("../../middleware/security-middleware");
const { moderateActionLimiter, strictAuthLimiter } = require("../../middleware/rate-limiters");
const { 
  createSecureUpload, 
  validateUploadedFiles, 
  uploadRateLimit 
} = require("../../middleware/secure-upload-middleware");
const { approveCertificate, revokeCertificate, listApprovedForCourse, checkEligibility } = require("../../controllers/instructor-controller/certificate-controller");
const {
  secureCreateCourse,
  secureUpdateCourse,
  secureDeleteCourse,
  secureMediaUpload,
  secureBulkMediaUpload
} = require("../../controllers/instructor-controller/secure-instructor-controller");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Remove router-level CSRF; app-level middleware already handles skips/security
// router.use(csrfProtection);

// Course routes with comprehensive security
router.post("/courses", 
  moderateActionLimiter, // Rate limiting
  secureCreateCourse
);

router.put("/courses/:courseId", 
  moderateActionLimiter, // Rate limiting
  secureUpdateCourse
);

router.delete("/courses/:courseId", 
  strictAuthLimiter, // Strict rate limiting for deletion
  secureDeleteCourse
);

// Secure media upload routes
const secureUpload = createSecureUpload({
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedTypes: [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ],
  maxFiles: 10,
  fieldName: 'file'
});

// Single file upload with comprehensive security
router.post("/media/upload", 
  uploadRateLimit(15, 15 * 60 * 1000), // 15 uploads per 15 minutes
  secureUpload.single("file"),
  validateUploadedFiles,
  secureMediaUpload
);

// Bulk file upload with comprehensive security
router.post("/media/bulk-upload", 
  uploadRateLimit(3, 15 * 60 * 1000), // 3 bulk uploads per 15 minutes
  secureUpload.array("files", 10), // Maximum 10 files
  validateUploadedFiles,
  secureBulkMediaUpload
);

// Image-specific upload route
const imageUpload = createSecureUpload({
  maxFileSize: 10 * 1024 * 1024, // 10MB for images
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ],
  maxFiles: 1,
  fieldName: 'image'
});

router.post("/media/upload-image", 
  uploadRateLimit(30, 15 * 60 * 1000), // 30 image uploads per 15 minutes
  imageUpload.single("image"),
  validateUploadedFiles,
  secureMediaUpload
);

// Video-specific upload route
const videoUpload = createSecureUpload({
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB for videos
  allowedTypes: [
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv'
  ],
  maxFiles: 1,
  fieldName: 'video'
});

router.post("/media/upload-video", 
  uploadRateLimit(2, 15 * 60 * 1000), // 2 video uploads per 15 minutes
  videoUpload.single("video"),
  validateUploadedFiles,
  secureMediaUpload
);

// Document-specific upload route
const documentUpload = createSecureUpload({
  maxFileSize: 50 * 1024 * 1024, // 50MB for documents
  allowedTypes: [
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ],
  maxFiles: 5,
  fieldName: 'document'
});

router.post("/media/upload-documents", 
  uploadRateLimit(5, 15 * 60 * 1000), // 5 document uploads per 15 minutes
  documentUpload.array("documents", 5),
  validateUploadedFiles,
  secureBulkMediaUpload
);

// Archive-specific upload route
const archiveUpload = createSecureUpload({
  maxFileSize: 200 * 1024 * 1024, // 200MB for archives
  allowedTypes: [
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ],
  maxFiles: 3,
  fieldName: 'archive'
});

router.post("/media/upload-archives", 
  uploadRateLimit(3, 15 * 60 * 1000), // 3 archive uploads per 15 minutes
  archiveUpload.array("archives", 3),
  validateUploadedFiles,
  secureBulkMediaUpload
);

// Audio-specific upload route
const audioUpload = createSecureUpload({
  maxFileSize: 100 * 1024 * 1024, // 100MB for audio
  allowedTypes: [
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ],
  maxFiles: 5,
  fieldName: 'audio'
});

router.post("/media/upload-audio", 
  uploadRateLimit(5, 15 * 60 * 1000), // 5 audio uploads per 15 minutes
  audioUpload.array("audio", 5),
  validateUploadedFiles,
  secureBulkMediaUpload
);

// Certificate approval routes (instructor/admin)
router.post("/certificates/approve", moderateActionLimiter, approveCertificate);
router.post("/certificates/revoke", moderateActionLimiter, revokeCertificate);
router.get("/certificates/approved/:courseId", listApprovedForCourse);
router.get("/certificates/eligibility/:courseId/:studentId", checkEligibility);

// Error handling middleware for upload routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message === 'File type not allowed') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }
  
  if (error.message === 'File too large') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }
  
  if (error.message === 'Dangerous file extension') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }
  
  if (error.message === 'Malicious file signature detected') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }
  
  if (error.message === 'File contains potentially malicious content') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    message: 'Upload failed'
  });
});

module.exports = router;
