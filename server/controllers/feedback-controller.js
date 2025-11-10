const FeedbackTicket = require("../models/FeedbackTicket");
const validator = require("validator");

// Submit feedback (student or instructor)
const submitFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Validate user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Determine user type based on role
    let userType = "student";
    if (req.user.role === "instructor") {
      userType = "instructor";
    } else if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot submit feedback tickets",
      });
    }

    // Validation
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    if (subject.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject must be less than 200 characters",
      });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be less than 2000 characters",
      });
    }

    // Sanitize inputs
    const sanitizedSubject = validator.escape(subject.trim());
    const sanitizedMessage = validator.escape(message.trim());

    // Create feedback ticket
    const ticket = new FeedbackTicket({
      userId: req.user._id,
      userType,
      userName: req.user.userName || "Unknown",
      userEmail: req.user.userEmail || "",
      subject: sanitizedSubject,
      message: sanitizedMessage,
      status: "open",
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. We'll get back to you soon!",
      data: {
        ticketId: ticket._id,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: error.message,
    });
  }
};

// Get user's own feedback tickets (student or instructor)
const getMyFeedbackTickets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tickets = await FeedbackTicket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching feedback tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching feedback tickets",
      error: error.message,
    });
  }
};

// Get single feedback ticket by ID (user's own ticket)
const getFeedbackTicketById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const ticket = await FeedbackTicket.findById(id).lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if ticket belongs to user
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This ticket does not belong to you.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching feedback ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching feedback ticket",
      error: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedbackTickets,
  getFeedbackTicketById,
};

