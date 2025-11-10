const router = require("express").Router();
const {
  getMyPrograms,
  getProgramTasks,
  submitTask,
  getTaskSubmission,
} = require("../../controllers/student-controller/internship-task-controller");
const authenticate = require("../../middleware/auth-middleware");

// All routes require authentication
router.get("/my-programs", authenticate, getMyPrograms);
router.get("/:programId/tasks", authenticate, getProgramTasks);
router.post("/tasks/:taskId/submit", authenticate, submitTask);
router.get("/tasks/:taskId/submission", authenticate, getTaskSubmission);

module.exports = router;
