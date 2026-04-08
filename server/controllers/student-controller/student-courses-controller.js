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

    // Filter out courses that no longer exist and SYNC current details (image, title)
    const validCourses = [];
    for (const course of studentBoughtCourses.courses) {
      try {
        const currentCourseData = await Course.findById(course.courseId);
        if (currentCourseData) {
          // Merge current data into the enrollment object
          validCourses.push({
            ...course.toObject(),
            title: currentCourseData.title, // Sync current title
            courseImage: currentCourseData.image, // Sync current image
          });
        } else {
          console.log(`Course ${course.courseId} no longer exists, removing from student ${studentId}`);
        }
      } catch (error) {
        console.error(`Error checking course ${course.courseId}:`, error);
      }
    }

    // Update the student's course list to remove deleted courses
    if (validCourses.length !== studentBoughtCourses.courses.length) {
      studentBoughtCourses.courses = validCourses.map(c => ({
        courseId: c.courseId,
        title: c.title,
        instructorId: c.instructorId,
        instructorName: c.instructorName,
        dateOfPurchase: c.dateOfPurchase,
        courseImage: c.courseImage
      }));
      await studentBoughtCourses.save();
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
