const mongoose = require("mongoose");

const QuizQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length >= 2 && arr.length <= 6;
        },
        message: "Each question must have between 2 and 6 options",
      },
      required: true,
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const QuizSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    instructorId: { type: String, required: true },
    title: { type: String, required: true },
    questions: {
      type: [QuizQuestionSchema],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 10; // fixed 10 questions per requirements
        },
        message: "Quiz must contain exactly 10 questions",
      },
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);


