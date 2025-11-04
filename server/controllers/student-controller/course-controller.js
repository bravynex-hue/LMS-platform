const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const mongoose = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
      search = "",
    } = req.query;

    console.log(req.query, "req.query");

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }
    if (typeof search === "string" && search.trim()) {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(term, "i");
      filters.$or = [
        { title: rx },
        { subtitle: rx },
        { description: rx },
        { instructorName: rx },
        { category: rx },
        { primaryLanguage: rx },
      ];
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;

        break;
      case "price-hightolow":
        sortParam.pricing = -1;

        break;
      case "title-atoz":
        sortParam.title = 1;

        break;
      case "title-ztoa":
        sortParam.title = -1;

        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    const coursesList = await Course.find(filters).sort(sortParam);

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.error("Error in getAllStudentViewCourses:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: e.message
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID format",
      });
    }
    
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.error("Error in getStudentViewCourseDetails:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching course details",
      error: e.message
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    
    console.log("Checking purchase info for:", { courseId: id, studentId });
    
    // Validate parameters
    if (!id || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Student ID are required",
      });
    }

    // Validate MongoDB ObjectIds
    if (!isValidObjectId(id) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID or Student ID format",
      });
    }

    // Check if student has any courses
    const studentCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    console.log("Student courses found:", studentCourses);

    // If student has no courses, they haven't bought this course
    if (!studentCourses || !studentCourses.courses || studentCourses.courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: false, // Not purchased
        message: "Student has no courses"
      });
    }

    // Check if student already bought the current course
    const ifStudentAlreadyBoughtCurrentCourse = studentCourses.courses.some(
      (item) => item.courseId === id
    );

    console.log("Purchase check result:", ifStudentAlreadyBoughtCurrentCourse);

    res.status(200).json({
      success: true,
      data: ifStudentAlreadyBoughtCurrentCourse,
      message: ifStudentAlreadyBoughtCurrentCourse ? "Course already purchased" : "Course not purchased"
    });
  } catch (e) {
    console.error("Error in checkCoursePurchaseInfo:", e);
    res.status(500).json({
      success: false,
      message: "Error checking course purchase information",
      error: e.message
    });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};
