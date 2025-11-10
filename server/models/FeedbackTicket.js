const mongoose = require("mongoose");

const FeedbackTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userType: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
FeedbackTicketSchema.index({ userId: 1 });
FeedbackTicketSchema.index({ status: 1 });
FeedbackTicketSchema.index({ userType: 1 });
FeedbackTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model("FeedbackTicket", FeedbackTicketSchema);

