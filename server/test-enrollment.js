/**
 * Test script to check and manually enroll students
 * Run with: node test-enrollment.js
 */

const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");
const StudentCourses = require("./models/StudentCourses");
require("dotenv").config();

async function testEnrollment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all courses
    const courses = await Course.find({}).select('title instructorId students');
    console.log(`\n📚 Found ${courses.length} courses:`);
    
    for (const course of courses) {
      console.log(`\n🎓 Course: ${course.title} (ID: ${course._id})`);
      console.log(`   Direct students: ${course.students?.length || 0}`);
      
      // Check StudentCourses for this course
      const purchasedCourses = await StudentCourses.find({
        'courses.courseId': course._id.toString()
      });
      console.log(`   Purchased enrollments: ${purchasedCourses.length}`);
      
      if (purchasedCourses.length > 0) {
        purchasedCourses.forEach(sc => {
          console.log(`     - Student ${sc.userId} purchased this course`);
        });
      }
    }

    // Get all StudentCourses records
    const allStudentCourses = await StudentCourses.find({});
    console.log(`\n💰 Total StudentCourses records: ${allStudentCourses.length}`);
    
    if (allStudentCourses.length > 0) {
      console.log("\n📋 Sample StudentCourses record:");
      console.log(JSON.stringify(allStudentCourses[0], null, 2));
    }

    // Get all users with role 'user'
    const students = await User.find({ role: 'user' }).select('userName userEmail');
    console.log(`\n👥 Found ${students.length} students in database`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the test
testEnrollment();
