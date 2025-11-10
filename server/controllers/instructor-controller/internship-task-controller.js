const InternshipTask = require("../../models/InternshipTask");
const InternshipProgram = require("../../models/InternshipProgram");

// Create a new task for an internship program
// programId can be either program ID or course ID
const createTask = async (req, res) => {
  try {
    const { programId } = req.params;
    const { title, description, phase, type, priority, dueDate, assignedTo } = req.body;
    const instructorId = req.user?._id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Try to find program by ID first
    let program = await InternshipProgram.findById(programId);
    
    // If not found, try by linkedCourseId (course ID)
    if (!program) {
      program = await InternshipProgram.findOne({ linkedCourseId: programId });
    }

    // If still not found, create a new program linked to this course
    if (!program) {
      program = await InternshipProgram.create({
        title: "Internship Program",
        instructorId,
        linkedCourseId: programId,
        students: [],
      });
    }

    if (program.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized to create tasks for this program" });
    }

    const task = await InternshipTask.create({
      internshipProgramId: program._id,
      title,
      description,
      phase,
      type: type || "task",
      priority: priority || "medium",
      dueDate,
      assignedTo: assignedTo || [],
      createdBy: instructorId,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

// Get all tasks for an internship program
// programId can be either program ID or course ID
const getTasks = async (req, res) => {
  try {
    const { programId } = req.params;
    const instructorId = req.user?._id;

    // Try to find program by ID first
    let program = await InternshipProgram.findById(programId);
    
    // If not found, try by linkedCourseId (course ID)
    if (!program) {
      program = await InternshipProgram.findOne({ linkedCourseId: programId });
    }

    if (!program) {
      // No program found - return empty tasks
      return res.status(200).json({ success: true, data: [] });
    }

    if (program.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized to view tasks for this program" });
    }

    const tasks = await InternshipTask.find({ internshipProgramId: program._id })
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("getTasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, phase, type, priority, dueDate, status, assignedTo } = req.body;
    const instructorId = req.user?._id;

    const task = await InternshipTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Verify instructor owns the program
    const program = await InternshipProgram.findById(task.internshipProgramId);
    if (!program || program.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (phase !== undefined) task.phase = phase;
    if (type !== undefined) task.type = type;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const instructorId = req.user?._id;

    const task = await InternshipTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Verify instructor owns the program
    const program = await InternshipProgram.findById(task.internshipProgramId);
    if (!program || program.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
    }

    await InternshipTask.findByIdAndDelete(taskId);

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
