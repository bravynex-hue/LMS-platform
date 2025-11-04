const StudentCourses = require("../../models/StudentCourses");
const Course = require("../../models/Course");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentBoughtCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    if (!studentBoughtCourses || !studentBoughtCourses.courses) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Filter out courses that no longer exist (deleted by instructor)
    const validCourses = [];
    for (const course of studentBoughtCourses.courses) {
      try {
        const courseExists = await Course.findById(course.courseId);
        if (courseExists) {
          validCourses.push(course);
        } else {
          console.log(`Course ${course.courseId} no longer exists, removing from student ${studentId}`);
        }
      } catch (error) {
        console.error(`Error checking course ${course.courseId}:`, error);
        // If there's an error checking the course, assume it's invalid
      }
    }

    // Update the student's course list to remove deleted courses
    if (validCourses.length !== studentBoughtCourses.courses.length) {
      studentBoughtCourses.courses = validCourses;
      await studentBoughtCourses.save();
      console.log(`Updated student ${studentId} courses: removed ${studentBoughtCourses.courses.length - validCourses.length} deleted courses`);
    }

    res.status(200).json({
      success: true,
      data: validCourses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { getCoursesByStudentId };
