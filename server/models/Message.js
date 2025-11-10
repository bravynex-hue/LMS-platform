const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["instructor", "student"], required: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    recipientRole: { type: String, enum: ["instructor", "student"], required: true },
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    attachments: [{ 
      fileName: String, 
      fileUrl: String 
    }],
  },
  { timestamps: true }
);

// Indexes for efficient queries
MessageSchema.index({ courseId: 1, recipientId: 1, createdAt: -1 });
MessageSchema.index({ courseId: 1, senderId: 1, recipientId: 1 });

module.exports = mongoose.model("Message", MessageSchema);
