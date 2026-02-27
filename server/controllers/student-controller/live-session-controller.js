const LiveSession = require("../../models/LiveSession");

const listSessionsForProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    // programId is now treated as courseId since internship programs are removed
    const sessions = await LiveSession.find({ internshipProgramId: programId }).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("student listSessionsForProgram error", error);
    res.status(500).json({ success: false, message: "Failed to list sessions" });
  }
};

const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("getSessionDetails error", error);
    res.status(500).json({ success: false, message: "Failed to fetch session" });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, studentName, studentEmail } = req.body;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    const now = new Date();
    const alreadyJoined = (session.attendance || []).find(a => a.studentId === studentId);
    if (!alreadyJoined) {
      session.attendance.push({ studentId, studentName, studentEmail, joinedAt: now });
      await session.save();
    }
    // Block legacy Jitsi links
    if (session.meetingLink && /jit\.si/i.test(session.meetingLink)) {
      return res.status(400).json({ success: false, message: "Meeting link is not available" });
    }
    // Return session's meeting link or default Google Meet link
    const meetingLink = session.meetingLink || process.env.GOOGLE_MEET_LINK || "https://meet.google.com/landing?authuser=0";
    res.status(200).json({ success: true, meetingLink });
  } catch (error) {
    console.error("joinSession error", error);
    res.status(500).json({ success: false, message: "Failed to join session" });
  }
};

module.exports = {
  listSessionsForProgram,
  getSessionDetails,
  joinSession,
};


