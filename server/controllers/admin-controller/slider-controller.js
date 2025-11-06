const Slider = require("../../models/Slider");
const cloudinary = require("../../helpers/cloudinary");

// Get all sliders (public endpoint)
const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    
    return res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    console.error("Get sliders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};

// Get all sliders for admin (including inactive)
const getAdminSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    
    return res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    console.error("Get admin sliders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};

// Create new slider
const createSlider = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      badge,
      imageUrl,
      public_id,
      statLeft,
      statMid,
      statRight,
      order,
      isActive,
    } = req.body;

    if (!title || !subtitle || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, subtitle, and image are required",
      });
    }

    const slider = new Slider({
      title,
      subtitle,
      badge,
      imageUrl,
      public_id,
      statLeft,
      statMid,
      statRight,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await slider.save();

    return res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: slider,
    });
  } catch (error) {
    console.error("Create slider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create slider",
    });
  }
};

// Update slider
const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const slider = await Slider.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });
  } catch (error) {
    console.error("Update slider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update slider",
    });
  }
};

// Delete slider
const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (slider.public_id) {
      try {
        await cloudinary.uploader.destroy(slider.public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with slider deletion even if Cloudinary fails
      }
    }

    await Slider.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("Delete slider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete slider",
    });
  }
};

// Toggle slider active status
const toggleSliderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    slider.isActive = !slider.isActive;
    slider.updatedAt = Date.now();
    await slider.save();

    return res.status(200).json({
      success: true,
      message: `Slider ${slider.isActive ? "activated" : "deactivated"} successfully`,
      data: slider,
    });
  } catch (error) {
    console.error("Toggle slider status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle slider status",
    });
  }
};

// Reorder sliders
const reorderSliders = async (req, res) => {
  try {
    const { sliders } = req.body; // Array of { id, order }

    if (!Array.isArray(sliders)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    // Update order for each slider
    const updatePromises = sliders.map(({ id, order }) =>
      Slider.findByIdAndUpdate(id, { order, updatedAt: Date.now() })
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: "Sliders reordered successfully",
    });
  } catch (error) {
    console.error("Reorder sliders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder sliders",
    });
  }
};

module.exports = {
  getAllSliders,
  getAdminSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  toggleSliderStatus,
  reorderSliders,
};
