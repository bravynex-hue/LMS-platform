const CertificateApproval = require("../../models/CertificateApproval");
const User = require("../../models/User");
const Course = require("../../models/Course");
const CourseProgress = require("../../models/CourseProgress");

// Get all certificate requests with optional filtering
const getAllCertificateRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { status, type } = req.query;
    
    // Build query
    let query = {};
    
    if (status) {
      if (status === "pending") {
        query.$or = [
          { approvedAt: { $exists: false } },
          { approvedAt: null }
        ];
        query.revoked = { $ne: true };
      } else if (status === "approved") {
        query.approvedAt = { $exists: true, $ne: null };
        query.revoked = { $ne: true };
      } else if (status === "rejected") {
        query.revoked = true;
      }
    }
    
    // Fetch certificate approvals
    const certificates = await CertificateApproval.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Enrich with user and course details
    const enrichedCertificates = await Promise.all(
      certificates.map(async (cert) => {
        const [student, course] = await Promise.all([
          User.findById(cert.studentId).select("userName userEmail").lean(),
          Course.findById(cert.courseId).select("title certificateCourseName").lean(),
        ]);
        
        // Determine status
        let certStatus = "pending";
        if (cert.revoked) {
          certStatus = "rejected";
        } else if (cert.approvedAt) {
          certStatus = "approved";
        }
        
        return {
          _id: cert._id,
          certificateId: cert.certificateId,
          studentId: cert.studentId,
          studentName: cert.studentName || student?.userName || "Unknown",
          studentEmail: cert.studentEmail || student?.userEmail || "",
          courseId: cert.courseId,
          courseName: cert.courseTitle || course?.certificateCourseName || course?.title || "Unknown Course",
          type: "course", // Can be extended for internships
          status: certStatus,
          instructorApproved: !!cert.approvedAt,
          requestedDate: cert.createdAt,
          approvedDate: cert.approvedAt,
          revokedDate: cert.revokedAt,
          approvedBy: cert.approvedBy,
          notes: cert.notes,
          grade: cert.grade,
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: enrichedCertificates,
      count: enrichedCertificates.length,
    });
  } catch (error) {
    console.error("Error fetching certificate requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate requests",
      error: error.message,
    });
  }
};

// Get single certificate request by ID
const getCertificateRequestById = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    
    const certificate = await CertificateApproval.findById(id).lean();
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate request not found",
      });
    }
    
    // Enrich with details
    const [student, course, approver] = await Promise.all([
      User.findById(certificate.studentId).select("userName userEmail guardianName studentId").lean(),
      Course.findById(certificate.courseId).select("title certificateCourseName instructorId").lean(),
      certificate.approvedBy ? User.findById(certificate.approvedBy).select("userName userEmail").lean() : null,
    ]);
    
    const enrichedCertificate = {
      ...certificate,
      studentName: certificate.studentName || student?.userName,
      studentEmail: certificate.studentEmail || student?.userEmail,
      courseName: certificate.courseTitle || course?.certificateCourseName || course?.title,
      approverName: approver?.userName,
      approverEmail: approver?.userEmail,
    };
    
    res.status(200).json({
      success: true,
      data: enrichedCertificate,
    });
  } catch (error) {
    console.error("Error fetching certificate request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate request",
      error: error.message,
    });
  }
};

// Approve certificate request and generate certificate
const approveCertificateRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { notes, grade } = req.body;
    const adminId = req.user._id;
    
    const certificate = await CertificateApproval.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate request not found",
      });
    }
    
    if (certificate.approvedAt && !certificate.revoked) {
      return res.status(400).json({
        success: false,
        message: "Certificate already approved",
      });
    }
    
    // Fetch student and course details for snapshot
    const [student, course] = await Promise.all([
      User.findById(certificate.studentId),
      Course.findById(certificate.courseId),
    ]);
    
    if (!student || !course) {
      return res.status(404).json({
        success: false,
        message: "Student or course not found",
      });
    }
    
    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Update certificate approval
    certificate.approvedBy = adminId;
    certificate.approvedAt = new Date();
    certificate.revoked = false;
    certificate.revokedAt = null;
    certificate.certificateId = certificateId;
    certificate.studentName = student.userName;
    certificate.studentEmail = student.userEmail;
    certificate.studentFatherName = student.guardianName || student.guardianDetails;
    certificate.customStudentId = student.studentId;
    certificate.courseTitle = course.certificateCourseName || course.title;
    certificate.grade = grade || certificate.grade || "A+";
    certificate.notes = notes || certificate.notes;
    
    console.log(`Generated Certificate ID: ${certificateId} for CertificateApproval ID: ${certificate._id}`);
    await certificate.save();
    
    res.status(200).json({
      success: true,
      message: "Certificate approved and generated successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Error approving certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve certificate",
      error: error.message,
    });
  }
};

// Reject certificate request
const rejectCertificateRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { reason } = req.body;
    
    const certificate = await CertificateApproval.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate request not found",
      });
    }
    
    certificate.revoked = true;
    certificate.revokedAt = new Date();
    certificate.notes = reason || certificate.notes || "Rejected by admin";
    
    await certificate.save();
    
    res.status(200).json({
      success: true,
      message: "Certificate request rejected",
      data: certificate,
    });
  } catch (error) {
    console.error("Error rejecting certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject certificate",
      error: error.message,
    });
  }
};

// Revoke an already approved certificate
const revokeCertificate = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { reason } = req.body;
    
    const certificate = await CertificateApproval.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }
    
    if (!certificate.approvedAt) {
      return res.status(400).json({
        success: false,
        message: "Certificate was never approved",
      });
    }
    
    certificate.revoked = true;
    certificate.revokedAt = new Date();
    certificate.notes = reason || certificate.notes || "Revoked by admin";
    
    await certificate.save();
    
    res.status(200).json({
      success: true,
      message: "Certificate revoked successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Error revoking certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke certificate",
      error: error.message,
    });
  }
};

// Generate/download certificate PDF
const generateCertificatePDF = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    
    const certificate = await CertificateApproval.findById(id).lean();
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }
    
    if (!certificate.approvedAt || certificate.revoked) {
      return res.status(400).json({
        success: false,
        message: "Certificate is not approved or has been revoked",
      });
    }
    
    // TODO: Implement actual PDF generation
    // For now, return certificate data
    res.status(200).json({
      success: true,
      message: "Certificate PDF generation coming soon",
      data: certificate,
    });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate PDF",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCertificateRequests,
  getCertificateRequestById,
  approveCertificateRequest,
  rejectCertificateRequest,
  revokeCertificate,
  generateCertificatePDF,
};
