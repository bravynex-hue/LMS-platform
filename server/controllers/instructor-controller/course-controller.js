const Course = require("../../models/Course");


const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;
    console.log('=== ADDING NEW COURSE ===');
    console.log('Course data:', courseData);
    
    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      console.log('Course saved successfully:', saveCourse._id);
      console.log('Instructor ID from course:', saveCourse.instructorId);
      console.log('Instructor Name from course:', saveCourse.instructorName);

      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.error('Error adding new course:', e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const coursesList = await Course.find({});

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourseData = req.body;

    // Preserve critical fields that shouldn't be overwritten during course edits
    // Remove students array from update data to prevent resetting enrolled students
    const { students, ...safeUpdateData } = updatedCourseData;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // Add force delete option
    
    console.log('=== DELETE COURSE ===');
    console.log('Course ID:', id);
    console.log('Force delete:', force);
    console.log('Authenticated user:', req.user);
    console.log('Request headers:', req.headers);
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      console.log('Course not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }
    
    console.log('Course found:', {
      id: course._id,
      title: course.title,
      instructorId: course.instructorId,
      studentsCount: course.students?.length || 0
    });

    // Check if course has students enrolled
    if (course.students && course.students.length > 0) {
      if (force === 'true') {
        // Force delete: Remove all students first, then delete course
        try {
          // Remove all students from the course
          await Course.findByIdAndUpdate(id, { $set: { students: [] } });
          console.log(`Force delete: Removed ${course.students.length} students from course before deletion`);
        } catch (removeError) {
          console.error('Error removing students from course:', removeError);
          return res.status(500).json({
            success: false,
            message: "Failed to remove students from course. Please try again.",
          });
        }
      } else {
        // Normal delete: Prevent deletion if students exist
        return res.status(400).json({
          success: false,
          message: `Cannot delete course with ${course.students.length} enrolled students. Use force=true to force delete.`,
        });
      }
    }

    // Store course data before deletion for notification and cleanup
    const courseData = {
      instructorId: course.instructorId,
      title: course.title,
      _id: course._id,
      students: course.students || []
    };

    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (deletedCourse) {
      try {
        // Clean up StudentCourses collection - remove this course from all students
        if (courseData.students && courseData.students.length > 0) {
          const StudentCourses = require("../../models/StudentCourses");
          const CourseProgress = require("../../models/CourseProgress");
          
          // Remove course from all students' purchased courses
          await StudentCourses.updateMany(
            { "courses.courseId": id },
            { $pull: { courses: { courseId: id } } }
          );
          console.log(`Cleaned up StudentCourses for ${courseData.students.length} students`);
          
          // Remove course progress for all students
          await CourseProgress.deleteMany({ courseId: id });
          console.log(`Cleaned up CourseProgress for course ${id}`);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
        // Continue with deletion even if cleanup fails
      }

      console.log('Course deleted successfully:', deletedCourse._id);
      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        data: deletedCourse,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete course",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while deleting course!",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
  deleteCourseByID,
};
