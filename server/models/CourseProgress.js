const mongoose = require("mongoose");

const LectureProgressSchema = new mongoose.Schema({
  lectureId: String,
  viewed: Boolean,
  dateViewed: Date,
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 }, // Track video completion percentage
});

const CourseProgressSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  completed: Boolean,
  completionDate: Date,
  lecturesProgress: [LectureProgressSchema],
});

module.exports = mongoose.model("Progress", CourseProgressSchema);
