const Message = require("../../models/Message");
const Course = require("../../models/Course");
const { emitNewMessage } = require("../../socket");

// Get instructor for a course
const getCourseInstructor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify student is enrolled
    const isEnrolled = course.students.some(s => s.studentId === studentId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        instructorId: course.instructorId,
        instructorName: course.instructorName,
      }
    });
  } catch (error) {
    console.error("getCourseInstructor error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch instructor" });
  }
};

// Send message to instructor
const sendMessageToInstructor = async (req, res) => {
  try {
    const { courseId, subject, message } = req.body;
    const studentId = req.user?._id;
    const studentName = req.user?.userName || req.user?.userEmail;

    if (!courseId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Course and message are required" 
      });
    }

    // Verify student is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isEnrolled = course.students.some(s => s.studentId === studentId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    // Create message
    const newMessage = await Message.create({
      courseId,
      senderId: studentId,
      senderName: studentName,
      senderRole: "student",
      recipientId: course.instructorId,
      recipientName: course.instructorName,
      recipientRole: "instructor",
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
    console.error("sendMessageToInstructor error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// Get conversation with instructor
const getConversationWithInstructor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    // Verify student is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isEnrolled = course.students.some(s => s.studentId === studentId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    // Get all messages between student and instructor for this course
    const messages = await Message.find({
      courseId,
      $or: [
        { senderId: studentId, recipientId: course.instructorId },
        { senderId: course.instructorId, recipientId: studentId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages from instructor as read
    await Message.updateMany(
      {
        courseId,
        senderId: course.instructorId,
        recipientId: studentId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("getConversationWithInstructor error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversation" });
  }
};

// Get all conversations for student
const getMyConversations = async (req, res) => {
  try {
    const studentId = req.user?._id;

    // Get all messages where student is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: studentId },
        { recipientId: studentId }
      ]
    }).sort({ createdAt: -1 });

    // Group by course
    const conversationsMap = {};
    messages.forEach(msg => {
      const key = msg.courseId;
      
      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          courseId: msg.courseId,
          instructorName: msg.senderId === studentId ? msg.recipientName : msg.senderName,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        };
      }
      
      // Count unread messages from instructor
      if (msg.recipientId === studentId && !msg.isRead) {
        conversationsMap[key].unreadCount++;
      }
    });

    const conversations = Object.values(conversationsMap);

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("getMyConversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

// Clear conversation with instructor
const clearConversation = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    // Verify student is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isEnrolled = course.students.some(s => s.studentId === studentId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    // Delete all messages in this conversation
    const result = await Message.deleteMany({
      courseId,
      $or: [
        { senderId: studentId, recipientId: course.instructorId },
        { senderId: course.instructorId, recipientId: studentId }
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
  getCourseInstructor,
  sendMessageToInstructor,
  getConversationWithInstructor,
  getMyConversations,
  clearConversation,
};
