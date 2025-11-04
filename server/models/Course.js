const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  public_id: String,
  freePreview: Boolean,
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,

  date: Date,
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  pricing: Number,
  objectives: String,
  // certificate settings
  certificateEnabled: { type: Boolean, default: true },
  certificateTemplateUrl: String, // optional remote/background image
  certificateIssuer: { type: String, default: "Chief Executive Officer" },
  certificateOrganization: { type: String, default: "BRAVYNEX ENGINEERING" },
  certificateGradeEnabled: { type: Boolean, default: false },
  certificateCourseName: String, // optional custom course name to print
  certificateFrom: { type: String, default: "BRAVYNEX ENGINEERING" },
  defaultCertificateGrade: { type: String, default: "A" },
  // course completion settings
  completionPercentage: { type: Number, default: 95, min: 1, max: 100 }, // percentage required to complete each video
  sequentialAccess: { type: Boolean, default: true }, // whether videos must be watched in sequence
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String,
    },
  ],
  curriculum: [LectureSchema],
  isPublised: Boolean,
});

module.exports = mongoose.model("Course", CourseSchema);
