const Message = require("../../models/Message");
const Course = require("../../models/Course");
const User = require("../../models/User");
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

    // Get enrolled students
    const students = course.students || [];
    console.log("Returning students:", students.length);
    console.log("Sample student data:", students[0]);
    
    // Fetch actual user data for students who don't have names
    const studentIds = students.map(s => s.studentId);
    const users = await User.find({ _id: { $in: studentIds } }).select('userName userEmail');
    
    // Create a map of userId to user data
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });
    
    res.status(200).json({ 
      success: true, 
      data: students.map(s => {
        const user = userMap[s.studentId];
        return {
          studentId: s.studentId,
          studentName: s.studentName || user?.userName || "Student",
          studentEmail: s.studentEmail || user?.userEmail || "",
        };
      })
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

    // Find recipient student
    const student = course.students.find(s => s.studentId === recipientId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found in course" });
    }

    // Get student name from User model if not in course.students
    let recipientName = student.studentName;
    if (!recipientName) {
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
