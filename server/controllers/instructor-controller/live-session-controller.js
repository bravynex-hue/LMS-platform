const LiveSession = require("../../models/LiveSession");
const Course = require("../../models/Course");
// const { randomUUID } = require("node:crypto");

// Simplified: sessions use a manual meeting link (any platform). No Google API calls.

const scheduleSession = async (req, res) => {
  try {
    const {
      internshipProgramId,
      courseId, // preferred
      instructorId,
      instructorName,
      topic,
      description,
      startTime,
      durationMinutes = 60,
      meetingLink: providedMeetingLink,
    } = req.body;

    if (!instructorId || !topic || !startTime || !(courseId || internshipProgramId)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // validate time is in future
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid startTime" });
    }
    if (start.getTime() < Date.now() - 60 * 1000) {
      return res.status(400).json({ success: false, message: "startTime must be in the future" });
    }

    // validate course exists and owned by instructor
    const courseRefId = courseId || internshipProgramId;
    const course = await Course.findById(courseRefId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructorId && course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "You are not the instructor of this course" });
    }

    // Accept a pre-generated meeting link (any platform) or leave empty to set later
    const meetingLink = typeof providedMeetingLink === "string" ? providedMeetingLink.trim() : "";
    const moderatorLink = meetingLink;

    const session = await LiveSession.create({
      internshipProgramId: courseRefId,
      instructorId,
      instructorName: instructorName || course.instructorName,
      topic,
      description,
      startTime: start,
      durationMinutes,
      meetingProvider: "link",
      meetingLink,
      moderatorLink,
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("scheduleSession error", error);
    res.status(500).json({ success: false, message: "Failed to schedule session" });
  }
};

const addRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { recordingUrl } = req.body;
    const session = await LiveSession.findByIdAndUpdate(
      sessionId,
      { recordingUrl },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("addRecording error", error);
    res.status(500).json({ success: false, message: "Failed to add recording" });
  }
};

const addResource = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, url } = req.body;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.resources.push({ title, url });
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("addResource error", error);
    res.status(500).json({ success: false, message: "Failed to add resource" });
  }
};

const listSessionsForProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const sessions = await LiveSession.find({ internshipProgramId: programId }).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("listSessionsForProgram error", error);
    res.status(500).json({ success: false, message: "Failed to list sessions" });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    const rows = Array.isArray(session.attendance) ? session.attendance : [];
    const seen = new Set();
    const unique = [];
    for (const entry of rows) {
      const key = entry?.studentId || entry?._id?.toString();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    res.status(200).json({ success: true, data: unique });
  } catch (error) {
    console.error("getAttendance error", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance" });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { instructorId } = req.query; // optional guard
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (instructorId && session.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    await LiveSession.findByIdAndDelete(sessionId);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    console.error("deleteSession error", error);
    res.status(500).json({ success: false, message: "Failed to delete session" });
  }
};

// Allow instructor to update meeting link manually (e.g., after creating ad-hoc Meet)
const setMeetingLink = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { meetingLink } = req.body;
    if (!meetingLink || typeof meetingLink !== "string") {
      return res.status(400).json({ success: false, message: "Invalid meeting link" });
    }
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.meetingLink = meetingLink;
    session.moderatorLink = meetingLink;
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("setMeetingLink error", error);
    res.status(500).json({ success: false, message: "Failed to set meeting link" });
  }
};

module.exports = {
  scheduleSession,
  addRecording,
  addResource,
  listSessionsForProgram,
  getAttendance,
  deleteSession,
  setMeetingLink,
};


