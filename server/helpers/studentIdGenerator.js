const User = require("../models/User");

/**
 * Generate a unique student ID in the format: BRX-STU-XXXX
 * BRX = Bravynex (organization name)
 * STU = Student
 * XXXX = Unique sequential number starting from 1001
 */
async function generateUniqueStudentId() {
  const prefix = "BRX-STU-";
  const startNumber = 1001;
  
  // Find the highest existing student ID number
  const lastStudent = await User.findOne({ studentId: { $exists: true, $ne: null } })
    .sort({ studentId: -1 })
    .limit(1);
  
  let nextNumber = startNumber;
  
  if (lastStudent && lastStudent.studentId) {
    // Extract the numeric part from the last student ID
    const match = lastStudent.studentId.match(/BRX-STU-(\d+)/);
    if (match && match[1]) {
      const lastNumber = parseInt(match[1], 10);
      nextNumber = lastNumber + 1;
    }
  }
  
  // Generate the new student ID
  const studentId = `${prefix}${nextNumber}`;
  
  // Double-check for uniqueness (in case of race conditions)
  const exists = await User.findOne({ studentId });
  if (exists) {
    // Recursively generate a new ID if collision occurs
    return generateUniqueStudentId();
  }
  
  return studentId;
}

module.exports = { generateUniqueStudentId };
