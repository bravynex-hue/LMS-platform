const InternshipProgram = require("../../models/InternshipProgram");

const createProgram = async (req, res) => {
  try {
    const { title, description, instructorId, instructorName, startDate, endDate, pricing = 0 } = req.body;
    if (!title || !instructorId) {
      return res.status(400).json({ success: false, message: "Title and instructorId are required" });
    }
    const program = await InternshipProgram.create({ title, description, instructorId, instructorName, startDate, endDate, pricing });
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error("createProgram error", error);
    res.status(500).json({ success: false, message: "Failed to create program" });
  }
};

const listPrograms = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const query = instructorId ? { instructorId } : {};
    const programs = await InternshipProgram.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    console.error("listPrograms error", error);
    res.status(500).json({ success: false, message: "Failed to list programs" });
  }
};

module.exports = { createProgram, listPrograms };


