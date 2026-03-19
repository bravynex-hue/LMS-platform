const router = require("express").Router();
const {
  getCourseInstructor,
  sendMessageToInstructor,
  getConversationWithInstructor,
  getMyConversations,
  clearConversation,
} = require("../../controllers/student-controller/messaging-controller");
const authenticate = require("../../middleware/auth-middleware");

// All routes require authentication
router.get("/courses/:courseId/instructor", authenticate, getCourseInstructor);
router.post("/send", authenticate, sendMessageToInstructor);
router.get("/conversation/:courseId", authenticate, getConversationWithInstructor);
router.get("/conversations", authenticate, getMyConversations);
router.delete("/conversation/:courseId/clear", authenticate, clearConversation);

module.exports = router;
