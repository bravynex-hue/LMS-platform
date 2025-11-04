const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true, min: 0, max: 9 },
    selectedIndex: { type: Number, required: true, min: 0 },
    correct: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizSubmissionSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true },
    courseId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String },
    answers: { type: [AnswerSchema], required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

QuizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("QuizSubmission", QuizSubmissionSchema);


