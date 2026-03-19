const express = require("express");
const {
  submitFeedback,
  getMyFeedbackTickets,
  getFeedbackTicketById,
} = require("../controllers/feedback-controller");
const authenticate = require("../middleware/auth-middleware");

const router = express.Router();

// All routes require authentication
router.post("/", authenticate, submitFeedback);
router.get("/", authenticate, getMyFeedbackTickets);
router.get("/:id", authenticate, getFeedbackTicketById);

module.exports = router;

