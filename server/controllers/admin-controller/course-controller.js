const Course = require("../../models/Course");
const User = require("../../models/User");

// Get all courses (admin only) - with instructor and student info
const getAllCourses = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Get all courses - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all courses
    const courses = await Course.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Get all unique instructor IDs
    const instructorIds = [...new Set(courses.map(c => c.instructorId).filter(Boolean))];
    
    // Fetch instructor details
    const instructors = await User.find({ _id: { $in: instructorIds } })
      .select("userName userEmail _id")
      .lean();
    
    // Create instructor map
    const instructorMap = {};
    instructors.forEach(instructor => {
      instructorMap[instructor._id.toString()] = {
        userName: instructor.userName,
        userEmail: instructor.userEmail,
      };
    });

    // Enrich courses with student count and instructor name
    const enrichedCourses = courses.map((course) => {
      const studentCount = course.students?.length || 0;
      const instructorInfo = instructorMap[course.instructorId?.toString()] || {};
      const instructorName = course.instructorName || instructorInfo.userName || "N/A";

      return {
        ...course,
        studentCount,
        instructorName,
        instructorEmail: instructorInfo.userEmail || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedCourses,
      count: enrichedCourses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// Get course by ID (admin only)
const getCourseById = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Get course by ID - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Fetch instructor details if instructorId exists
    let instructorInfo = {};
    if (course.instructorId) {
      const instructor = await User.findById(course.instructorId)
        .select("userName userEmail")
        .lean();
      if (instructor) {
        instructorInfo = {
          userName: instructor.userName,
          userEmail: instructor.userEmail,
        };
      }
    }

    // Enrich with student count
    const studentCount = course.students?.length || 0;
    const instructorName = course.instructorName || instructorInfo.userName || "N/A";

    const enrichedCourse = {
      ...course,
      studentCount,
      instructorName,
      instructorEmail: instructorInfo.userEmail || null,
    };

    return res.status(200).json({
      success: true,
      data: enrichedCourse,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    });
  }
};

// Update course metadata (admin only) - title, description, pricing
const updateCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Update course - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { title, description, pricing } = req.body;

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update only allowed fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pricing !== undefined) updateData.pricing = pricing;

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log(`Course ${id} updated by admin ${req.user.userName} (${req.user._id})`);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating course",
      error: error.message,
    });
  }
};

// Approve course (admin only) - set isPublised to true
const approveCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Approve course - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    // Find and update course
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: { isPublised: true } },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log(`Course ${id} (${course.title}) approved by admin ${req.user.userName} (${req.user._id})`);

    return res.status(200).json({
      success: true,
      message: "Course approved successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error approving course:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving course",
      error: error.message,
    });
  }
};

// Unpublish course (admin only) - set isPublised to false
const unpublishCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Unpublish course - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    // Find and update course
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: { isPublised: false } },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log(`Course ${id} (${course.title}) unpublished by admin ${req.user.userName} (${req.user._id})`);

    return res.status(200).json({
      success: true,
      message: "Course unpublished successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error unpublishing course:", error);
    return res.status(500).json({
      success: false,
      message: "Error unpublishing course",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  updateCourse,
  approveCourse,
  unpublishCourse,
};

