/**
 * Migration script to generate student IDs for existing users
 * Run this once to assign BRX-STU-XXXX IDs to users who don't have one
 * 
 * Usage: node helpers/migrateStudentIds.js
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const { generateUniqueStudentId } = require("./studentIdGenerator");
require("dotenv").config();

async function migrateStudentIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Find all users with 'user' role who don't have a studentId
    const usersWithoutStudentId = await User.find({
      role: 'user',
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: '' }
      ]
    });
    
    console.log(`\n📊 Found ${usersWithoutStudentId.length} users without student IDs`);
    
    if (usersWithoutStudentId.length === 0) {
      console.log("✅ All users already have student IDs!");
      await mongoose.connection.close();
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Generate student IDs for each user
    for (const user of usersWithoutStudentId) {
      try {
        const studentId = await generateUniqueStudentId();
        user.studentId = studentId;
        await user.save();
        
        console.log(`✅ Assigned ${studentId} to ${user.userName} (${user.userEmail})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error assigning student ID to ${user.userEmail}:`, error.message);
        errorCount++;
      }
    }
    
    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${usersWithoutStudentId.length}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Migration completed and database connection closed");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateStudentIds();
}

module.exports = { migrateStudentIds };
