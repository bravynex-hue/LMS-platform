const CertificateApproval = require("../../models/CertificateApproval");
const User = require("../../models/User");
const Course = require("../../models/Course");

const approveCertificate = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const approverId = req.body.approverId || req.user?.id;
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

module.exports = { approveCertificate, revokeCertificate, listApprovedForCourse, checkEligibility };


