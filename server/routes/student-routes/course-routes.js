const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
  checkCoursePurchaseInfo,
} = require("../../controllers/student-controller/course-controller");
const cacheMiddleware = require("../../middleware/cache-middleware");
const router = express.Router();

router.get("/get", cacheMiddleware(5 * 60), getAllStudentViewCourses);
router.get("/get/details/:id", cacheMiddleware(5 * 60), getStudentViewCourseDetails);
router.get("/purchase-info/:id/:studentId", checkCoursePurchaseInfo);

module.exports = router;
