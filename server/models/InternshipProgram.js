const mongoose = require("mongoose");

const InternshipEnrollmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  studentEmail: { type: String },
  enrolledAt: { type: Date, default: Date.now },
});

const InternshipProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    instructorId: { type: String, required: true },
    instructorName: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    image: { type: String },
    category: { type: String },
    level: { type: String },
    primaryLanguage: { type: String },
    pricing: { type: Number, default: 0 },
    certificateEnabled: { type: Boolean, default: true },
    students: [InternshipEnrollmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternshipProgram", InternshipProgramSchema);


