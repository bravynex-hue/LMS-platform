const FeedbackTicket = require("../../models/FeedbackTicket");
const User = require("../../models/User");

// Get all feedback tickets (admin only)
const getAllFeedbackTickets = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Get all feedback tickets - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all tickets with populated user info
    const tickets = await FeedbackTicket.find({})
      .populate("userId", "userName userEmail")
      .populate("resolvedBy", "userName")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich tickets with user info (fallback if populate didn't work)
    const enrichedTickets = tickets.map((ticket) => {
      return {
        ...ticket,
        userName: ticket.userId?.userName || ticket.userName || "Unknown",
        userEmail: ticket.userId?.userEmail || ticket.userEmail || "",
        resolvedByName: ticket.resolvedBy?.userName || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedTickets,
      count: enrichedTickets.length,
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

// Get single feedback ticket by ID (admin only)
const getFeedbackTicketById = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const ticket = await FeedbackTicket.findById(id)
      .populate("userId", "userName userEmail")
      .populate("resolvedBy", "userName")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Enrich with user info
    const enrichedTicket = {
      ...ticket,
      userName: ticket.userId?.userName || ticket.userName || "Unknown",
      userEmail: ticket.userId?.userEmail || ticket.userEmail || "",
      resolvedByName: ticket.resolvedBy?.userName || null,
    };

    return res.status(200).json({
      success: true,
      data: enrichedTicket,
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

// Update ticket status (admin only)
const updateTicketStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { status, adminResponse } = req.body;

    // Validate status
    const validStatuses = ["open", "in-progress", "resolved"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const ticket = await FeedbackTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Update status
    if (status) {
      ticket.status = status;
      if (status === "resolved" && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = req.user._id;
      }
    }

    // Update admin response
    if (adminResponse !== undefined) {
      if (adminResponse && adminResponse.trim().length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Admin response must be less than 2000 characters",
        });
      }
      ticket.adminResponse = adminResponse ? adminResponse.trim() : null;
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating ticket",
      error: error.message,
    });
  }
};

// Resolve ticket (admin only) - convenience endpoint
const resolveTicket = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { adminResponse } = req.body;

    const ticket = await FeedbackTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = "resolved";
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user._id;

    if (adminResponse) {
      if (adminResponse.trim().length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Admin response must be less than 2000 characters",
        });
      }
      ticket.adminResponse = adminResponse.trim();
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket marked as resolved",
      data: ticket,
    });
  } catch (error) {
    console.error("Error resolving ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error resolving ticket",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFeedbackTickets,
  getFeedbackTicketById,
  updateTicketStatus,
  resolveTicket,
};

