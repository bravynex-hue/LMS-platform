const Quiz = require("../../models/Quiz");
const QuizSubmission = require("../../models/QuizSubmission");

// Create or update a quiz for a course
const upsertCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user?.id || req.user?._id || req.body.instructorId;
    const { title, questions } = req.body;

    if (!Array.isArray(questions) || questions.length !== 10) {
      return res.status(400).json({ success: false, message: "Quiz must have exactly 10 questions" });
    }

    for (const q of questions) {
      if (!q || typeof q.questionText !== "string" || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ success: false, message: "Invalid question structure" });
      }
      if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return res.status(400).json({ success: false, message: "Invalid correctIndex in one of the questions" });
      }
    }

    const update = { courseId, instructorId, title: title || "Course Quiz", questions, active: true };

    const quiz = await Quiz.findOneAndUpdate({ courseId }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    return res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to save quiz" });
  }
};

// Get quiz by course (includes correct answers for instructor)
const getCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    return res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch quiz" });
  }
};

// List submissions for a quiz
const listQuizSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    const submissions = await QuizSubmission.find({ quizId: quiz._id.toString() }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to list submissions" });
  }
};

// Delete a quiz (only by the instructor who created it)
const deleteCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user?.id || req.user?._id;

    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find the quiz
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Check if the current user is the creator of the quiz
    if (quiz.instructorId.toString() !== instructorId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to delete this quiz. Only the quiz creator can delete it." 
      });
    }

    // Delete the quiz
    await Quiz.findOneAndDelete({ courseId });

    // Optionally, delete all submissions for this quiz
    await QuizSubmission.deleteMany({ quizId: quiz._id.toString() });

    return res.status(200).json({ 
      success: true, 
      message: "Quiz and all related submissions deleted successfully" 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete quiz" });
  }
};

module.exports = {
  upsertCourseQuiz,
  getCourseQuiz,
  listQuizSubmissions,
  deleteCourseQuiz,
};


