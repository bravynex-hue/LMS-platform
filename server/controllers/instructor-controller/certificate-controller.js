const CertificateApproval = require("../../models/CertificateApproval");
const User = require("../../models/User");
const Course = require("../../models/Course");
const mongoose = require("mongoose");

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

    const validStudentIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    // Fetch all users and course info in parallel
    const [users, course] = await Promise.all([
      User.find({ _id: { $in: validStudentIds } }),
      Course.findById(courseId)
    ]);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const courseTitle = course.certificateCourseName || course.title || undefined;

    // Use bulkWrite for better performance if updating many docs
    const operations = validStudentIds.map((studentId) => {
      const user = userMap[studentId];
      if (!user) return null;

      const studentName = user.userName || user.userEmail || String(studentId);
      const studentEmail = user.userEmail || undefined;
      const studentFatherName = user.guardianName || user.guardianDetails || undefined;
      const customStudentId = user.studentId || undefined;

      return {
        updateOne: {
          filter: { courseId, studentId },
          update: {
            $set: {
              approvedBy: approverId,
              approvedAt: new Date(),
              revoked: false,
              revokedAt: null,
              studentName,
              studentEmail,
              studentFatherName,
              customStudentId,
              courseTitle,
            }
          },
          upsert: true
        }
      };
    }).filter(Boolean);

    if (operations.length > 0) {
      await CertificateApproval.bulkWrite(operations);
    }

    res.status(200).json({ success: true, count: operations.length });
  } catch (e) {
    console.error('Bulk approve error:', e);
    res.status(500).json({ 
      success: false, 
      message: e.message || "Failed to bulk approve certificates",
      error: e.name
    });
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


