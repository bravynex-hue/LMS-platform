const express = require("express");
const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
  generateCompletionCertificate,
  updateVideoProgress,
} = require("../../controllers/student-controller/course-progress-controller");

const router = express.Router();

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/update-video-progress", updateVideoProgress);
router.post("/reset-progress", resetCurrentCourseProgress);
router.get("/certificate/:userId/:courseId", generateCompletionCertificate);
module.exports = router;
