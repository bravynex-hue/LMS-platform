const express = require("express");
const {
  getAllTransactions,
  exportTransactionsReport,
} = require("../../controllers/admin-controller/payment-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Debug middleware to log request details
const debugAdminRequest = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin payment request debug:", {
      method: req.method,
      path: req.path,
      user: req.user ? {
        _id: req.user._id,
        role: req.user.role,
        userName: req.user.userName,
      } : "No user",
      query: req.query,
    });
  }
  next();
};

// All routes require authentication and admin role
router.get("/", authenticate, debugAdminRequest, getAllTransactions);
router.get("/export", authenticate, debugAdminRequest, exportTransactionsReport);

module.exports = router;

