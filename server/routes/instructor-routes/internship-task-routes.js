const router = require("express").Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../../controllers/instructor-controller/internship-task-controller");
const authenticate = require("../../middleware/auth-middleware");

// All routes require authentication
router.post("/:programId/tasks", authenticate, createTask);
router.get("/:programId/tasks", authenticate, getTasks);
router.put("/tasks/:taskId", authenticate, updateTask);
router.delete("/tasks/:taskId", authenticate, deleteTask);

module.exports = router;
