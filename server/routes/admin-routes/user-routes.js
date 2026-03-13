const express = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserBlock,
  deleteUser,
} = require("../../controllers/admin-controller/user-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Debug middleware to log request details
const debugAdminRequest = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin request debug:", {
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
router.get("/", authenticate, debugAdminRequest, getAllUsers);
router.post("/", authenticate, debugAdminRequest, createUser);
router.put("/:id", authenticate, debugAdminRequest, updateUser);
router.patch("/:id/toggle-block", authenticate, debugAdminRequest, toggleUserBlock);
router.delete("/:id", authenticate, debugAdminRequest, deleteUser);

module.exports = router;

