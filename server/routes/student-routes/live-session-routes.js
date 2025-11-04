const router = require("express").Router();
const {
  listSessionsForProgram,
  getSessionDetails,
  joinSession,
} = require("../../controllers/student-controller/live-session-controller");

// List sessions for program/course
router.get("/program/:programId", listSessionsForProgram);

// Get session details
router.get("/:sessionId", getSessionDetails);

// Join session (records attendance, returns link)
router.post("/:sessionId/join", joinSession);

module.exports = router;


