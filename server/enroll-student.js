/**
 * Manual student enrollment script
 * Usage: node enroll-student.js <studentEmail> <courseTitle>
 * Example: node enroll-student.js student@example.com "AI Data Engineer"
 */

const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");
const StudentCourses = require("./models/StudentCourses");
require("dotenv").config();

async function enrollStudent(studentEmail, courseTitle) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find student by email
    const student = await User.findOne({ userEmail: studentEmail, role: 'user' });
    if (!student) {
      console.log("❌ Student not found with email:", studentEmail);
      process.exit(1);
    }
    console.log("👤 Found student:", student.userName, `(${student.userEmail})`);

    // Find course by title
    const course = await Course.findOne({ title: new RegExp(courseTitle, 'i') });
    if (!course) {
      console.log("❌ Course not found with title:", courseTitle);
      process.exit(1);
    }
    console.log("🎓 Found course:", course.title, `(${course._id})`);

    // Check if already enrolled via StudentCourses
    const existingEnrollment = await StudentCourses.findOne({
      userId: student._id.toString(),
      'courses.courseId': course._id.toString()
    });

    if (existingEnrollment) {
      console.log("✅ Student already enrolled via purchase records");
    } else {
      // Enroll student via StudentCourses
      let studentCourses = await StudentCourses.findOne({ userId: student._id.toString() });
      
      if (studentCourses) {
        // Add course to existing record
        studentCourses.courses.push({
          courseId: course._id.toString(),
          title: course.title,
          instructorId: course.instructorId,
          instructorName: "Instructor", // You might want to fetch this
          dateOfPurchase: new Date(),
          courseImage: course.image
        });
        await studentCourses.save();
        console.log("✅ Added course to existing StudentCourses record");
      } else {
        // Create new StudentCourses record
        studentCourses = new StudentCourses({
          userId: student._id.toString(),
          courses: [{
            courseId: course._id.toString(),
            title: course.title,
            instructorId: course.instructorId,
            instructorName: "Instructor",
            dateOfPurchase: new Date(),
            courseImage: course.image
          }]
        });
        await studentCourses.save();
        console.log("✅ Created new StudentCourses record");
      }
    }

    // Also add to course.students array if not already there
    const isInCourseStudents = course.students?.some(s => s.studentId === student._id.toString());
    if (!isInCourseStudents) {
      if (!course.students) course.students = [];
      course.students.push({
        studentId: student._id.toString(),
        studentName: student.userName,
        studentEmail: student.userEmail,
        dateOfEnrollment: new Date()
      });
      await course.save();
      console.log("✅ Added student to course.students array");
    } else {
      console.log("✅ Student already in course.students array");
    }

    console.log("\n🎉 Student enrollment completed successfully!");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log("Usage: node enroll-student.js <studentEmail> <courseTitle>");
  console.log('Example: node enroll-student.js student@example.com "AI Data Engineer"');
  process.exit(1);
}

const [studentEmail, courseTitle] = args;
enrollStudent(studentEmail, courseTitle);
