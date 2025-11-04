const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const { upsertCourseQuiz, getCourseQuiz, listQuizSubmissions, deleteCourseQuiz } = require("../../controllers/instructor-controller/quiz-controller");

const router = express.Router();

router.use(authenticate);

// More specific routes first
router.get("/:courseId/submissions", listQuizSubmissions);

// Then general CRUD routes
router.post("/:courseId", upsertCourseQuiz);
router.get("/:courseId", getCourseQuiz);
router.delete("/:courseId", deleteCourseQuiz);

module.exports = router;


