const Message = require("../../models/Message");
const Course = require("../../models/Course");
const User = require("../../models/User");
const StudentCourses = require("../../models/StudentCourses");
const { emitNewMessage } = require("../../socket");

// Get students enrolled in a course
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user?._id;

    console.log("Getting students for course:", courseId);
    console.log("Instructor ID:", instructorId);

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log("Course instructor ID:", course.instructorId);
    console.log("Course students count:", course.students?.length || 0);

    if (course.instructorId !== instructorId) {
      console.log("Authorization failed - instructor mismatch");
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Get enrolled students from multiple sources
    const enrolledStudentIds = new Set();
    
    // 1. Students directly enrolled in course.students array
    const directStudents = course.students || [];
    directStudents.forEach(s => enrolledStudentIds.add(s.studentId));
    
    // 2. Students who purchased the course
    const purchasedCourses = await StudentCourses.find({
      'courses.courseId': courseId
    });
    purchasedCourses.forEach(studentCourse => {
      enrolledStudentIds.add(studentCourse.userId);
    });
    
    // 3. For free courses, we could potentially include all users, but that's not practical
    // Instead, we'll rely on direct enrollment and purchases
    
    console.log("Total enrolled students found:", enrolledStudentIds.size);
    
    // Fetch user data for all enrolled students
    const users = await User.find({ 
      _id: { $in: Array.from(enrolledStudentIds) },
      role: 'user' // Only include students, not instructors/admins
    }).select('userName userEmail');
    
    // Create student data combining direct enrollment info with user data
    const studentData = users.map(user => {
      // Check if student has direct enrollment data
      const directStudent = directStudents.find(s => s.studentId === user._id.toString());
      
      return {
        studentId: user._id.toString(),
        studentName: directStudent?.studentName || user.userName || "Student",
        studentEmail: directStudent?.studentEmail || user.userEmail || "",
      };
    });
    
    console.log("Returning students:", studentData.length);
    
    res.status(200).json({ 
      success: true, 
      data: studentData
    });
  } catch (error) {
    console.error("getCourseStudents error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
};

// Send message to student
const sendMessage = async (req, res) => {
  try {
    const { courseId, recipientId, subject, message } = req.body;
    const instructorId = req.user?._id;
    const instructorName = req.user?.userName || req.user?.userEmail;

    if (!courseId || !recipientId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Course, recipient, and message are required" 
      });
    }

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course || course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Check if recipient is enrolled in the course (comprehensive check)
    let isStudentEnrolled = false;
    let recipientName = "Student";
    
    // 1. Check direct enrollment
    const directStudent = course.students?.find(s => s.studentId === recipientId);
    if (directStudent) {
      isStudentEnrolled = true;
      recipientName = directStudent.studentName;
    }
    
    // 2. Check purchase records if not found in direct enrollment
    if (!isStudentEnrolled) {
      const purchasedCourse = await StudentCourses.findOne({
        userId: recipientId,
        'courses.courseId': courseId
      });
      if (purchasedCourse) {
        isStudentEnrolled = true;
      }
    }
    
    if (!isStudentEnrolled) {
      return res.status(404).json({ success: false, message: "Student not found in course" });
    }

    // Get student name from User model if not available
    if (!recipientName || recipientName === "Student") {
      const user = await User.findById(recipientId).select('userName userEmail');
      recipientName = user?.userName || user?.userEmail || "Student";
    }

    // Create message
    const newMessage = await Message.create({
      courseId,
      senderId: instructorId,
      senderName: instructorName,
      senderRole: "instructor",
      recipientId,
      recipientName,
      recipientRole: "student",
      subject,
      message,
    });

    // Emit message via WebSocket
    emitNewMessage(courseId, newMessage);

    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      data: newMessage 
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// Get conversation with a student
const getConversation = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const instructorId = req.user?._id;

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course || course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Get all messages between instructor and student for this course
    const messages = await Message.find({
      courseId,
      $or: [
        { senderId: instructorId, recipientId: studentId },
        { senderId: studentId, recipientId: instructorId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages from student as read
    await Message.updateMany(
      {
        courseId,
        senderId: studentId,
        recipientId: instructorId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("getConversation error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversation" });
  }
};

// Get all conversations for instructor
const getAllConversations = async (req, res) => {
  try {
    const instructorId = req.user?._id;

    // Get all messages where instructor is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: instructorId },
        { recipientId: instructorId }
      ]
    }).sort({ createdAt: -1 });

    // Group by student and course
    const conversationsMap = {};
    messages.forEach(msg => {
      const studentId = msg.senderId === instructorId ? msg.recipientId : msg.senderId;
      const key = `${msg.courseId}-${studentId}`;
      
      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          courseId: msg.courseId,
          studentId,
          studentName: msg.senderId === instructorId ? msg.recipientName : msg.senderName,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        };
      }
      
      // Count unread messages from student
      if (msg.recipientId === instructorId && !msg.isRead) {
        conversationsMap[key].unreadCount++;
      }
    });

    const conversations = Object.values(conversationsMap);

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("getAllConversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

// Clear conversation with a student
const clearConversation = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const instructorId = req.user?._id;

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course || course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Delete all messages in this conversation
    const result = await Message.deleteMany({
      courseId,
      $or: [
        { senderId: instructorId, recipientId: studentId },
        { senderId: studentId, recipientId: instructorId }
      ]
    });

    res.status(200).json({ 
      success: true, 
      message: "Conversation cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("clearConversation error:", error);
    res.status(500).json({ success: false, message: "Failed to clear conversation" });
  }
};

module.exports = {
  getCourseStudents,
  sendMessage,
  getConversation,
  getAllConversations,
  clearConversation,
};
