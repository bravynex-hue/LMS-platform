const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { securityLogger } = require("./security-middleware");

// Define allowed file types with MIME types and extensions
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Videos
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogg'],
  'video/avi': ['.avi'],
  'video/mov': ['.mov'],
  'video/wmv': ['.wmv'],
  'video/flv': ['.flv'],
  'video/mkv': ['.mkv'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/mp4': ['.m4a'],
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 2 * 1024 * 1024 * 1024, // 2GB
  document: 50 * 1024 * 1024, // 50MB
  audio: 100 * 1024 * 1024, // 100MB
  archive: 200 * 1024 * 1024, // 200MB
};

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
  '.dll', '.sys', '.drv', '.msi', '.deb', '.rpm', '.app', '.dmg',
  '.iso', '.img', '.bin', '.run', '.sh', '.bash', '.zsh', '.fish'
];

// Malicious file signatures (magic numbers)
const MALICIOUS_SIGNATURES = [
  Buffer.from([0x4D, 0x5A]), // PE executable
  Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executable
  Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O executable
  Buffer.from([0xFE, 0xED, 0xFA, 0xCF]), // Mach-O executable (64-bit)
  Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Java class file
  Buffer.from([0x50, 0x4B, 0x03, 0x04]), // ZIP (but we allow legitimate ZIPs)
];

// Function to get file category based on MIME type
function getFileCategory(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'document';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return 'archive';
  return 'unknown';
}

// Function to validate file extension
function validateFileExtension(filename, mimetype) {
  const ext = path.extname(filename).toLowerCase();
  
  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, reason: 'Dangerous file extension' };
  }
  
  // Check if extension matches MIME type
  const allowedExtensions = ALLOWED_FILE_TYPES[mimetype];
  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return { valid: false, reason: 'File extension does not match MIME type' };
  }
  
  return { valid: true };
}

// Function to validate file signature (magic numbers)
function validateFileSignature(buffer, mimetype) {
  // If we don't have a buffer preview (e.g., streaming from disk), skip deep signature checks
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { valid: true };
  }
  // Check for malicious signatures
  for (const signature of MALICIOUS_SIGNATURES) {
    if (buffer.slice(0, signature.length).equals(signature)) {
      return { valid: false, reason: 'Malicious file signature detected' };
    }
  }
  
  // Validate expected signatures for common file types
  const validSignatures = {
    'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
    'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
    'image/gif': [Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])],
    'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])],
    'video/mp4': [Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]), Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70])],
  };
  
  const expectedSignatures = validSignatures[mimetype];
  if (expectedSignatures) {
    const isValid = expectedSignatures.some(sig => 
      buffer.slice(0, sig.length).equals(sig)
    );
    if (!isValid) {
      // Relaxed validation for common MP4 variants: allow if 'ftyp' box is present near the start
      if (mimetype === 'video/mp4') {
        const searchWindow = buffer.slice(0, Math.min(8192, buffer.length));
        const ftypIndex = searchWindow.indexOf(Buffer.from('ftyp'));
        if (ftypIndex !== -1) {
          return { valid: true };
        }
      }
      return { valid: false, reason: 'File signature does not match MIME type' };
    }
  }
  
  return { valid: true };
}

// Function to sanitize filename
function sanitizeFilename(filename) {
  // Remove path traversal attempts
  const basename = path.basename(filename);
  
  // Remove or replace dangerous characters
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    return `file_${Date.now()}`;
  }
  
  return sanitized;
}

// Create secure multer configuration
const createSecureUpload = (options = {}) => {
  const {
    maxFileSize = 2 * 1024 * 1024 * 1024, // 2GB default
    allowedTypes = Object.keys(ALLOWED_FILE_TYPES),
    maxFiles = 10,
    fieldName = 'file'
  } = options;

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    try {
      // Log upload attempt
      securityLogger.info('File upload attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        userId: req.user?.id
      });

      // Check MIME type
      if (!allowedTypes.includes(file.mimetype)) {
        securityLogger.warn('File upload blocked - invalid MIME type', {
          ip: req.ip,
          filename: file.originalname,
          mimetype: file.mimetype,
          userId: req.user?.id
        });
        return cb(new Error('File type not allowed'), false);
      }

      // Validate file extension
      const extValidation = validateFileExtension(file.originalname, file.mimetype);
      if (!extValidation.valid) {
        securityLogger.warn('File upload blocked - invalid extension', {
          ip: req.ip,
          filename: file.originalname,
          reason: extValidation.reason,
          userId: req.user?.id
        });
        return cb(new Error(extValidation.reason), false);
      }

      // Check file size based on category
      const category = getFileCategory(file.mimetype);
      const maxSize = FILE_SIZE_LIMITS[category] || maxFileSize;
      
      if (file.size > maxSize) {
        securityLogger.warn('File upload blocked - file too large', {
          ip: req.ip,
          filename: file.originalname,
          size: file.size,
          maxSize,
          category,
          userId: req.user?.id
        });
        return cb(new Error(`File too large. Maximum size for ${category} files: ${Math.round(maxSize / 1024 / 1024)}MB`), false);
      }

      // Sanitize filename
      file.originalname = sanitizeFilename(file.originalname);

      cb(null, true);
    } catch (error) {
      securityLogger.error('File filter error', {
        ip: req.ip,
        filename: file.originalname,
        error: error.message,
        userId: req.user?.id
      });
      cb(new Error('File validation failed'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
      fieldSize: 1024 * 1024, // 1MB for field names
      fieldNameSize: 100,
      fields: 10
    }
  });
};

// Middleware to validate uploaded files
const validateUploadedFiles = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    
    for (const file of files) {
      // Obtain a small preview buffer (first N bytes) for signature checks
      let previewBuffer = file.buffer;
      if (!previewBuffer && file.path) {
        const fd = fs.openSync(file.path, 'r');
        try {
          const len = Math.min(8192, fs.statSync(file.path).size || 8192);
          const tmp = Buffer.alloc(len);
          fs.readSync(fd, tmp, 0, len, 0);
          previewBuffer = tmp;
        } finally {
          fs.closeSync(fd);
        }
      }
      // Validate file signature
      const signatureValidation = validateFileSignature(previewBuffer, file.mimetype);
      if (!signatureValidation.valid) {
        securityLogger.warn('File upload blocked - invalid signature', {
          ip: req.ip,
          filename: file.originalname,
          reason: signatureValidation.reason,
          userId: req.user?.id
        });
        return res.status(400).json({
          success: false,
          message: signatureValidation.reason
        });
      }

      // Additional security checks: ensure non-empty content
      let fileSizeBytes = 0;
      if (file && typeof file.size === 'number') {
        fileSizeBytes = file.size;
      } else if (file && file.buffer && Buffer.isBuffer(file.buffer)) {
        fileSizeBytes = file.buffer.length;
      } else if (file && file.path) {
        try { fileSizeBytes = fs.statSync(file.path).size || 0; } catch (_) { fileSizeBytes = 0; }
      }
      if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Empty file not allowed'
        });
      }

      // Check for embedded scripts in file content
      const contentSource = previewBuffer || file.buffer;
      const content = contentSource && Buffer.isBuffer(contentSource)
        ? contentSource.toString('utf8', 0, Math.min(1024, contentSource.length))
        : "";
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
        /eval\(/i,
        /document\./i,
        /window\./i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          securityLogger.warn('File upload blocked - suspicious content', {
            ip: req.ip,
            filename: file.originalname,
            pattern: pattern.toString(),
            userId: req.user?.id
          });
          return res.status(400).json({
            success: false,
            message: 'File contains potentially malicious content'
          });
        }
      }
    }

    // Log successful validation
    securityLogger.info('File upload validation passed', {
      ip: req.ip,
      fileCount: files.length,
      userId: req.user?.id
    });

    next();
  } catch (error) {
    securityLogger.error('File validation error', {
      ip: req.ip,
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

// Rate limiting for file uploads
const uploadRateLimit = (maxUploads = 10, windowMs = 15 * 60 * 1000) => {
  const uploads = new Map();
  
  return (req, res, next) => {
    const key = req.ip + (req.user?.id || 'anonymous');
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (uploads.has(key)) {
      const userUploads = uploads.get(key).filter(time => time > windowStart);
      uploads.set(key, userUploads);
    } else {
      uploads.set(key, []);
    }
    
    const userUploads = uploads.get(key);
    
    if (userUploads.length >= maxUploads) {
      securityLogger.warn('File upload rate limit exceeded', {
        ip: req.ip,
        uploads: userUploads.length,
        maxUploads,
        userId: req.user?.id
      });
      return res.status(429).json({
        success: false,
        message: 'Too many file uploads. Please try again later.'
      });
    }
    
    // Record this upload attempt
    userUploads.push(now);
    
    next();
  };
};

module.exports = {
  createSecureUpload,
  validateUploadedFiles,
  uploadRateLimit,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  sanitizeFilename,
  validateFileExtension,
  validateFileSignature
};
