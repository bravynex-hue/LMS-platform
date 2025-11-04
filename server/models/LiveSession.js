const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  studentEmail: { type: String },
  joinedAt: { type: Date },
  leftAt: { type: Date },
});

const ResourceSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const LiveSessionSchema = new mongoose.Schema(
  {
    internshipProgramId: { type: String, required: true },
    instructorId: { type: String, required: true },
    instructorName: { type: String },
    topic: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    meetingProvider: { type: String, enum: ["link"], default: "link" },
    meetingLink: { type: String },
    moderatorLink: { type: String },
    recordingUrl: { type: String },
    resources: [ResourceSchema],
    attendance: [AttendanceSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveSession", LiveSessionSchema);


