const InternshipTask = require("../../models/InternshipTask");
const InternshipProgram = require("../../models/InternshipProgram");

// Get student's enrolled internship programs
const getMyPrograms = async (req, res) => {
  try {
    const studentId = req.user?._id;

    const programs = await InternshipProgram.find({
      "students.studentId": studentId
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    console.error("getMyPrograms error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch programs" });
  }
};

// Get tasks for a specific program (student view)
// programId can be either the program ID or the linked course ID
const getProgramTasks = async (req, res) => {
  try {
    const { programId } = req.params;
    const studentId = req.user?._id;

    // First, try to find program by ID
    let program = await InternshipProgram.findById(programId);
    
    // If not found, try to find by linkedCourseId (course ID)
    if (!program) {
      program = await InternshipProgram.findOne({ linkedCourseId: programId });
    }

    if (!program) {
      // No program found - return empty tasks (not an error, just no tasks assigned yet)
      return res.status(200).json({ success: true, data: [] });
    }

    // Get tasks for this program (no enrollment check - if program exists, show tasks)
    const tasks = await InternshipTask.find({
      internshipProgramId: program._id,
    }).sort({ order: 1, dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("getProgramTasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// Submit work for a task
const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { submissionText, links, fileNames, attachmentUrl } = req.body;
    const studentId = req.user?._id;
    const studentName = req.user?.userName || req.user?.userEmail;

    const task = await InternshipTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if student already submitted
    const existingSubmission = task.submissions.find(s => s.studentId === studentId);
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: "Already submitted. Contact instructor to resubmit." });
    }

    // Add submission with enhanced data
    task.submissions.push({
      studentId,
      studentName,
      submissionText,
      links: links || {},
      fileNames: fileNames || [],
      attachmentUrl, // Legacy support
      status: "submitted",
    });

    // Update task status if needed
    if (task.status === "pending") {
      task.status = "in-progress";
    }

    await task.save();

    res.status(200).json({ success: true, message: "Task submitted successfully", data: task });
  } catch (error) {
    console.error("submitTask error:", error);
    res.status(500).json({ success: false, message: "Failed to submit task" });
  }
};

// Get submission status for a task
const getTaskSubmission = async (req, res) => {
  try {
    const { taskId } = req.params;
    const studentId = req.user?._id;

    const task = await InternshipTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const submission = task.submissions.find(s => s.studentId === studentId);
    
    res.status(200).json({ 
      success: true, 
      data: submission || null,
      hasSubmitted: !!submission
    });
  } catch (error) {
    console.error("getTaskSubmission error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch submission" });
  }
};

module.exports = { getMyPrograms, getProgramTasks, submitTask, getTaskSubmission };
