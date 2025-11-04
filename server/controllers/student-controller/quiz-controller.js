const Quiz = require("../../models/Quiz");
const QuizSubmission = require("../../models/QuizSubmission");

// Get quiz for a course for student view (hide correctIndex)
const getQuizForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id || req.user?._id || req.query.studentId;
    const quiz = await Quiz.findOne({ courseId, active: true });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const submission = studentId
      ? await QuizSubmission.findOne({ quizId: quiz._id.toString(), studentId })
      : null;

    const safeQuiz = {
      _id: quiz._id,
      courseId: quiz.courseId,
      title: quiz.title,
      questions: quiz.questions.map((q) => ({ questionText: q.questionText, options: q.options })),
    };

    return res.status(200).json({ success: true, data: { quiz: safeQuiz, mySubmission: submission } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch quiz" });
  }
};

// Submit quiz answers
const submitQuizAnswers = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id || req.user?._id || req.body.studentId;
    const { studentName, answers } = req.body;

    if (!studentId) return res.status(400).json({ success: false, message: "Missing studentId" });

    const quiz = await Quiz.findOne({ courseId, active: true });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    if (!Array.isArray(answers) || answers.length !== 10) {
      return res.status(400).json({ success: false, message: "Answers must have exactly 10 entries" });
    }

    // Prevent duplicate submissions
    const existing = await QuizSubmission.findOne({ quizId: quiz._id.toString(), studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already submitted this quiz" });
    }

    let score = 0;
    const detailedAnswers = answers.map((selectedIndex, idx) => {
      const correct = Number(selectedIndex) === Number(quiz.questions[idx]?.correctIndex);
      if (correct) score += 1;
      return { questionIndex: idx, selectedIndex, correct };
    });

    const submission = await QuizSubmission.create({
      quizId: quiz._id.toString(),
      courseId,
      studentId,
      studentName,
      answers: detailedAnswers,
      score,
    });

    return res.status(200).json({ success: true, data: { score, submissionId: submission._id } });
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already submitted this quiz" });
    }
    return res.status(500).json({ success: false, message: "Failed to submit quiz" });
  }
};

module.exports = {
  getQuizForCourse,
  submitQuizAnswers,
};


