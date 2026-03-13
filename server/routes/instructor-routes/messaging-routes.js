const router = require("express").Router();
const {
  getCourseStudents,
  sendMessage,
  getConversation,
  getAllConversations,
  clearConversation,
} = require("../../controllers/instructor-controller/messaging-controller");
const authenticate = require("../../middleware/auth-middleware");

// All routes require authentication
router.get("/courses/:courseId/students", authenticate, getCourseStudents);
router.post("/send", authenticate, sendMessage);
router.get("/conversation/:courseId/:studentId", authenticate, getConversation);
router.get("/conversations", authenticate, getAllConversations);
router.delete("/conversation/:courseId/:studentId/clear", authenticate, clearConversation);

module.exports = router;
