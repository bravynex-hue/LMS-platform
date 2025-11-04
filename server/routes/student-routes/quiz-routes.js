const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const { getQuizForCourse, submitQuizAnswers } = require("../../controllers/student-controller/quiz-controller");

const router = express.Router();

router.use(authenticate);

router.get("/:courseId", getQuizForCourse);
router.post("/:courseId/submit", submitQuizAnswers);

module.exports = router;


