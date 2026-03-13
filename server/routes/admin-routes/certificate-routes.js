const express = require("express");
const {
  getAllCertificateRequests,
  getCertificateRequestById,
  approveCertificateRequest,
  rejectCertificateRequest,
  revokeCertificate,
  generateCertificatePDF,
} = require("../../controllers/admin-controller/certificate-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Debug middleware to log request details
const debugAdminRequest = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin certificate request debug:", {
      method: req.method,
      path: req.path,
      user: req.user ? {
        _id: req.user._id,
        role: req.user.role,
        userName: req.user.userName,
      } : "No user",
      params: req.params,
    });
  }
  next();
};

// All routes require authentication and admin role
router.get("/", authenticate, debugAdminRequest, getAllCertificateRequests);
router.get("/:id", authenticate, debugAdminRequest, getCertificateRequestById);
router.post("/:id/approve", authenticate, debugAdminRequest, approveCertificateRequest);
router.post("/:id/reject", authenticate, debugAdminRequest, rejectCertificateRequest);
router.post("/:id/revoke", authenticate, debugAdminRequest, revokeCertificate);
router.get("/:id/download", authenticate, debugAdminRequest, generateCertificatePDF);

module.exports = router;
