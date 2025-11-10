const mongoose = require("mongoose");

const TaskSubmissionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  submittedAt: { type: Date, default: Date.now },
  submissionText: { type: String },
  links: {
    github: { type: String },
    project: { type: String },
    other: { type: String },
  },
  fileNames: [{ type: String }], // Store file names for reference
  attachmentUrl: { type: String }, // Legacy field
  status: { type: String, enum: ["submitted", "reviewed", "approved", "rejected"], default: "submitted" },
  feedback: { type: String },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
});

const InternshipTaskSchema = new mongoose.Schema(
  {
    internshipProgramId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    phase: { type: String }, // Phase 1, Phase 2, Phase 3, etc.
    type: { type: String, enum: ["milestone", "task"], default: "task" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    assignedTo: [{ type: String }], // Array of student IDs
    submissions: [TaskSubmissionSchema],
    createdBy: { type: String }, // Instructor ID
    order: { type: Number, default: 0 }, // For ordering tasks
  },
  { timestamps: true }
);

// Index for efficient queries
InternshipTaskSchema.index({ internshipProgramId: 1, createdAt: -1 });
InternshipTaskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("InternshipTask", InternshipTaskSchema);
