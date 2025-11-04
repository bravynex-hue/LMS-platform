// const express = require("express");
// const multer = require("multer");
// const authenticate = require("../../middleware/auth-middleware");
// const { csrfProtection } = require("../../middleware/security-middleware");
// const { moderateActionLimiter } = require("../../middleware/rate-limiters");
// const { 
//   createSecureUpload, 
//   validateUploadedFiles, 
//   uploadRateLimit 
// } = require("../../middleware/secure-upload-middleware");
// const {
//   uploadMediaBufferToCloudinary,
//   uploadLargeBufferToCloudinary,
//   deleteMediaFromCloudinary,
// } = require("../../helpers/cloudinary");

// const router = express.Router();

// // Apply authentication middleware to all media routes
// router.use(authenticate);

// // Apply CSRF protection (temporarily disabled for testing)
// // router.use(csrfProtection);

// // Create secure upload configuration
// const secureUpload = createSecureUpload({
//   maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
//   allowedTypes: [
//     // Images
//     'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
//     // Videos
//     'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
//     // Documents
//     'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'text/plain', 'text/csv',
//     // Archives
//     'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
//     // Audio
//     'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
//   ],
//   maxFiles: 10,
//   fieldName: 'files' // Changed from 'file' to 'files'
// });

// // Legacy upload configuration (kept for backward compatibility)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 2 * 1024 * 1024 * 1024, // 2GB
//   },
// });

// // Secure single file upload
// router.post("/upload", 
//   uploadRateLimit(15, 15 * 60 * 1000), // 15 uploads per 15 minutes
//   secureUpload.single("file"),
//   validateUploadedFiles,
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ success: false, message: "No file uploaded" });
//       }
//       const isVideo = (req.file.mimetype || "").startsWith("video/");
//       const result = isVideo
//         ? await uploadLargeBufferToCloudinary(req.file.buffer, undefined, { resource_type: "video" })
//         : await uploadMediaBufferToCloudinary(req.file.buffer, undefined, { resource_type: "auto" });
//       res.status(200).json({
//         success: true,
//         data: result,
//       });
//     } catch (e) {
//       console.log("Cloudinary upload error:", e?.message);
//       res.status(500).json({ success: false, message: e?.message || "Error uploading file" });
//     }
//   }
// );

// router.delete("/delete/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Assest Id is required",
//       });
//     }

//     await deleteMediaFromCloudinary(id);

//     res.status(200).json({
//       success: true,
//       message: "Assest deleted successfully from cloudinary",
//     });
//   } catch (e) {
//     console.log(e);

//     res.status(500).json({ success: false, message: "Error deleting file" });
//   }
// });

// // Secure bulk file upload
// router.post("/bulk-upload", 
//   uploadRateLimit(20, 15 * 60 * 1000), // 20 bulk uploads per 15 minutes
//   secureUpload.array("files", 10),
//   validateUploadedFiles,
//   async (req, res) => {
//     try {
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: "No files uploaded" });
//       }
//       const uploadPromises = req.files.map((fileItem) => {
//         const isVideo = (fileItem.mimetype || "").startsWith("video/");
//         return isVideo
//           ? uploadLargeBufferToCloudinary(fileItem.buffer, undefined, { resource_type: "video" })
//           : uploadMediaBufferToCloudinary(fileItem.buffer, undefined, { resource_type: "auto" });
//       });

//       const results = await Promise.all(uploadPromises);

//       res.status(200).json({
//         success: true,
//         data: results,
//       });
//     } catch (event) {
//       console.log(event);

//       res
//         .status(500)
//         .json({ success: false, message: "Error in bulk uploading files" });
//     }
//   }
// );

// module.exports = router;



const express = require("express");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createReadStream, promises: fsp } = require("fs");
const authenticate = require("../../middleware/auth-middleware");
const { csrfProtection } = require("../../middleware/security-middleware");
const { moderateActionLimiter } = require("../../middleware/rate-limiters");
const { 
  createSecureUpload, 
  validateUploadedFiles, 
  uploadRateLimit 
} = require("../../middleware/secure-upload-middleware");
const {
  cloudinary
} = require("../../helpers/cloudinary");

const router = express.Router();

// Apply authentication middleware to all media routes
router.use(authenticate);

// Apply CSRF protection (optional, enable in prod)
// router.use(csrfProtection);

// Multer disk storage to avoid loading entire file into RAM
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(os.tmpdir(), "elearn-uploads");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safe = file.originalname || "upload";
      cb(null, `${unique}-${safe}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
});

// Helper: stream from file path to Cloudinary
const streamUploadFromPath = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    createReadStream(filePath).pipe(stream);
  });
};

// Single file upload
router.post(
  "/upload",
  uploadRateLimit(15, 15 * 60 * 1000), // 15 uploads per 15 min
  upload.single("file"),
  validateUploadedFiles,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const isVideo = (req.file.mimetype || "").startsWith("video/");
      const result = await streamUploadFromPath(req.file.path, {
        resource_type: isVideo ? "video" : "auto",
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ success: false, message: error?.message || "Error uploading file" });
    } finally {
      // Cleanup temp file
      if (req.file?.path) {
        fsp.unlink(req.file.path).catch(() => {});
      }
    }
  }
);

// Bulk file upload
router.post(
  "/bulk-upload",
  uploadRateLimit(20, 15 * 60 * 1000), // 20 bulk uploads per 15 min
  upload.array("files", 10),
  validateUploadedFiles,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      const uploadResults = await Promise.allSettled(
        req.files.map((fileItem) => {
          const isVideo = (fileItem.mimetype || "").startsWith("video/");
          return streamUploadFromPath(fileItem.path, {
            resource_type: isVideo ? "video" : "auto",
          });
        })
      );

      const successes = uploadResults
        .filter(r => r.status === "fulfilled")
        .map(r => r.value);
      const failures = uploadResults
        .filter(r => r.status === "rejected")
        .map(r => r.reason);

      res.status(200).json({
        success: failures.length === 0,
        uploaded: successes,
        failed: failures,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ success: false, message: "Error in bulk uploading files" });
    } finally {
      // Cleanup temp files
      await Promise.all(
        (req.files || []).map((f) => (f?.path ? fsp.unlink(f.path).catch(() => {}) : null))
      );
    }
  }
);

// Delete media
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Asset Id is required",
      });
    }
    const resourceTypes = ["video", "image", "raw"]; // auto not allowed for destroy
    let deleted = false;
    let lastError = null;
    for (const type of resourceTypes) {
      try {
        const result = await cloudinary.uploader.destroy(id, { resource_type: type });
        // Cloudinary returns { result: 'ok' } or 'not found'
        if (result && (result.result === "ok" || result.result === "not found")) {
          deleted = true;
          break;
        }
      } catch (e) {
        lastError = e;
      }
    }

    if (!deleted) {
      return res.status(500).json({ success: false, message: lastError?.message || "Failed to delete asset" });
    }

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully from Cloudinary",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Error deleting file" });
  }
});

module.exports = router;
