const express = require("express");
const router = express.Router();
const { getInstructorAnalytics } = require("../../controllers/instructor-controller/analytics-controller");

router.get("/get/:instructorId", getInstructorAnalytics);

module.exports = router;


