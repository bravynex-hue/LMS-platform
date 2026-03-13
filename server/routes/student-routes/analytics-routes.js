const express = require("express");
const router = express.Router();
const { getStudentAnalytics } = require("../../controllers/student-controller/analytics-controller");

// GET student analytics
router.get("/get/:userId", getStudentAnalytics);

module.exports = router;



