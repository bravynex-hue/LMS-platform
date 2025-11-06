const express = require("express");
const {
  getAllSliders,
  getAdminSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  toggleSliderStatus,
  reorderSliders,
} = require("../../controllers/admin-controller/slider-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

// Public route - get active sliders
router.get("/public", getAllSliders);

// Admin routes - require authentication
router.get("/", authenticate, getAdminSliders);
router.post("/", authenticate, createSlider);
router.put("/:id", authenticate, updateSlider);
router.delete("/:id", authenticate, deleteSlider);
router.patch("/:id/toggle", authenticate, toggleSliderStatus);
router.post("/reorder", authenticate, reorderSliders);

module.exports = router;
