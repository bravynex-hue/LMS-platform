const CertificateApproval = require("../../models/CertificateApproval");
const User = require("../../models/User");
const Course = require("../../models/Course");

const approveCertificate = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const approverId = req.body.approverId || req.user?._id || req.user?.id;
    if (!courseId || !studentId) return res.status(400).json({ success: false, message: "courseId and studentId are required" });
    // Fetch snapshot details
    const [user, course] = await Promise.all([
      User.findById(studentId),
      Course.findById(courseId),
    ]);
    const studentName = user?.userName || user?.userEmail || String(studentId);
    const studentEmail = user?.userEmail || undefined;
    const studentFatherName = user?.guardianName || user?.guardianDetails || undefined;
    const customStudentId = user?.studentId || undefined; // Custom student ID (BRX-STU-XXXX)
    const courseTitle = course?.certificateCourseName || course?.title || undefined;

    const doc = await CertificateApproval.findOneAndUpdate(
      { courseId, studentId },
      { 
        approvedBy: approverId, 
        approvedAt: new Date(), 
        revoked: false, 
        revokedAt: null,
        studentName,
        studentEmail,
        studentFatherName,
        customStudentId,
        courseTitle,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to approve certificate" });
  }
};

const revokeCertificate = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    if (!courseId || !studentId) return res.status(400).json({ success: false, message: "courseId and studentId are required" });
    const doc = await CertificateApproval.findOneAndUpdate(
      { courseId, studentId },
      { revoked: true, revokedAt: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to revoke certificate" });
  }
};

const listApprovedForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const docs = await CertificateApproval.find({ courseId, revoked: { $ne: true } });
    res.status(200).json({ success: true, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to list approvals" });
  }
};

const checkEligibility = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const doc = await CertificateApproval.findOne({ courseId, studentId, revoked: { $ne: true } });
    res.status(200).json({ success: true, data: Boolean(doc) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to check eligibility" });
  }
};

const bulkApproveCertificates = async (req, res) => {
  try {
    // Handle potential casing issues or missing body
    const courseId = req.body.courseId || req.body.courseid;
    const studentIds = req.body.studentIds || req.body.studentids;
    const approverId = req.body.approverId || req.body.approverid || req.user?._id || req.user?.id;
    
    console.log('Bulk approve check:', { courseId, studentIds, isArray: Array.isArray(studentIds) });
    
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }
    if (!studentIds) {
      return res.status(400).json({ success: false, message: "studentIds is required" });
    }
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: "studentIds must be an array" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const courseTitle = course?.certificateCourseName || course?.title || undefined;

    const mongoose = require("mongoose");
    const docs = await Promise.all(studentIds.map(async (studentId) => {
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        console.warn('Skipping invalid studentId:', studentId);
        return null;
      }
      const user = await User.findById(studentId);
      const studentName = user?.userName || user?.userEmail || String(studentId);
      const studentEmail = user?.userEmail || undefined;
      const studentFatherName = user?.guardianName || user?.guardianDetails || undefined;
      const customStudentId = user?.studentId || undefined;

      return CertificateApproval.findOneAndUpdate(
        { courseId, studentId },
        { 
          approvedBy: approverId, 
          approvedAt: new Date(), 
          revoked: false, 
          revokedAt: null,
          studentName,
          studentEmail,
          studentFatherName,
          customStudentId,
          courseTitle,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }));

    res.status(200).json({ success: true, count: docs.filter(Boolean).length });
  } catch (e) {
    console.error('Bulk approve error:', e);
    res.status(500).json({ success: false, message: "Failed to bulk approve certificates", error: e.message });
  }
};

const bulkRevokeCertificates = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }
    if (!studentIds) {
      return res.status(400).json({ success: false, message: "studentIds is required" });
    }
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: "studentIds must be an array" });
    }

    await CertificateApproval.updateMany(
      { courseId, studentId: { $in: studentIds } },
      { $set: { revoked: true, revokedAt: new Date() } }
    );

    res.status(200).json({ success: true, message: "Certificates revoked successfully" });
  } catch (e) {
    console.error('Bulk revoke error:', e);
    res.status(500).json({ success: false, message: "Failed to bulk revoke certificates", error: e.message });
  }
};

module.exports = { 
  approveCertificate, 
  revokeCertificate, 
  listApprovedForCourse, 
  checkEligibility,
  bulkApproveCertificates,
  bulkRevokeCertificates
};


