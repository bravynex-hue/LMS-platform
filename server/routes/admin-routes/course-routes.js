const express = require("express");
const {
  getAllCourses,
  getCourseById,
  updateCourse,
  approveCourse,
  unpublishCourse,
} = require("../../controllers/admin-controller/course-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Debug middleware to log request details
const debugAdminRequest = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin course request debug:", {
      method: req.method,
      path: req.path,
      user: req.user ? {
        _id: req.user._id,
        role: req.user.role,
        userName: req.user.userName,
      } : "No user",
      params: req.params,
    });
  }
  next();
};

// All routes require authentication and admin role
router.get("/", authenticate, debugAdminRequest, getAllCourses);
router.get("/:id", authenticate, debugAdminRequest, getCourseById);
router.put("/:id", authenticate, debugAdminRequest, updateCourse);
router.patch("/:id/approve", authenticate, debugAdminRequest, approveCourse);
router.patch("/:id/unpublish", authenticate, debugAdminRequest, unpublishCourse);

module.exports = router;

