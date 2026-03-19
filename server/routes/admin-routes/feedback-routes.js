const express = require("express");
const {
  getAllFeedbackTickets,
  getFeedbackTicketById,
  updateTicketStatus,
  resolveTicket,
} = require("../../controllers/admin-controller/feedback-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Debug middleware to log request details
const debugAdminRequest = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin feedback request debug:", {
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
router.get("/", authenticate, debugAdminRequest, getAllFeedbackTickets);
router.get("/:id", authenticate, debugAdminRequest, getFeedbackTicketById);
router.patch("/:id/status", authenticate, debugAdminRequest, updateTicketStatus);
router.patch("/:id/resolve", authenticate, debugAdminRequest, resolveTicket);

module.exports = router;

