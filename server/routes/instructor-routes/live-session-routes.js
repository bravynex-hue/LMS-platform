const router = require("express").Router();
const {
  scheduleSession,
  addRecording,
  addResource,
  listSessionsForProgram,
  getAttendance,
  deleteSession,
  setMeetingLink,
} = require("../../controllers/instructor-controller/live-session-controller");

// Schedule a live session
router.post("/schedule", scheduleSession);

// Add recording URL
router.post("/:sessionId/recording", addRecording);

// Add resource link
router.post("/:sessionId/resources", addResource);

// List sessions for a program/course
router.get("/program/:programId", listSessionsForProgram);

// Get attendance list
router.get("/:sessionId/attendance", getAttendance);

// Delete a session
router.delete("/:sessionId", deleteSession);

// Manually set/update meeting link
router.post("/:sessionId/meeting-link", setMeetingLink);

module.exports = router;


