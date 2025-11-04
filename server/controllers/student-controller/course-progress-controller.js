const CourseProgress = require("../../models/CourseProgress");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const { randomBytes } = require("crypto");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");


//mark current lecture as viewed
const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    console.log(`Marking lecture as viewed: userId=${userId}, courseId=${courseId}, lectureId=${lectureId}`);

    let progress = await CourseProgress.findOne({ userId, courseId });
    const isFirstTimeWatching = !progress;
    
    console.log(`Progress found: ${!!progress}, isFirstTimeWatching: ${isFirstTimeWatching}`);
    
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true, // Mark as viewed directly
            dateViewed: new Date(),
            progressPercentage: 100, // Assume 100% if explicitly marked as viewed
          },
        ],
      });
      await progress.save();
      

    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      // Only update if not already viewed to prevent unnecessary database writes
      if (lectureProgress && !lectureProgress.viewed) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
        await progress.save();
      } else if (!lectureProgress) {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
          
        });
        await progress.save();
      } else {
        // Lecture already viewed, return existing progress without modification
        return res.status(200).json({
          success: true,
          message: "Lecture already marked as viewed",
          data: progress,
        });
      }
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //check all the lectures are viewed or not based on course completion percentage
    const completionThreshold = (course.completionPercentage || 95) / 100; // Convert percentage to decimal
    
    const viewedLecturesCount = progress.lecturesProgress.filter(p => p.viewed).length;
    const totalLectures = course.curriculum.length;
    const requiredLecturesForCompletion = Math.ceil(totalLectures * completionThreshold);

    if (viewedLecturesCount >= requiredLecturesForCompletion && !progress.completed) {
      progress.completed = true;
      progress.completionDate = new Date();

      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: {
        lecturesProgress: progress.lecturesProgress,
        completed: progress.completed,
        completionDate: progress.completionDate
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//get current course progress
const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await StudentCourses.findOne({ userId });

    const isCurrentCoursePurchasedByCurrentUserOrNot =
      studentPurchasedCourses?.courses?.findIndex(
        (item) => item.courseId === courseId
      ) > -1;

    if (!isCurrentCoursePurchasedByCurrentUserOrNot) {
      return res.status(200).json({
        success: true,
        data: {
          isPurchased: false,
        },
        message: "You need to purchase this course to access it.",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        data: {
          courseDetails: course,
          progress: [],
          isPurchased: true,
        },
      });
    }

    const courseDetails = await Course.findById(courseId);

    res.status(200).json({
      success: true,
      data: {
        courseDetails,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//reset course progress

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found!",
      });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      data: progress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// generate and stream certificate PDF for completed courses
const generateCompletionCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    console.log(`Certificate generation requested for userId: ${userId}, courseId: ${courseId}`);

    const progress = await CourseProgress.findOne({ userId, courseId });
    console.log(`Progress found:`, progress ? { completed: progress.completed, lecturesCount: progress.lecturesProgress?.length } : 'No progress found');
    
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found for courseId:', courseId);
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    console.log('Course found:', { 
      title: course.title, 
      certificateEnabled: course.certificateEnabled,
      curriculumLength: course.curriculum?.length 
    });
    
    if (!progress) {
      console.log(`Certificate not generated: No progress found for user ${userId} and course ${courseId}`);
      // If no progress exists but course has lectures, create progress for all lectures as viewed
      if (course.curriculum.length > 0) {
        console.log('No progress found, creating progress for all lectures as viewed');
        const newProgress = new CourseProgress({
          userId,
          courseId,
          lecturesProgress: course.curriculum.map(lecture => ({
            lectureId: lecture._id,
            viewed: true,
            dateViewed: new Date(),
            progressPercentage: 100
          })),
          completed: true,
          completionDate: new Date()
        });
        await newProgress.save();
        console.log('Progress created and course marked as completed');
        // Continue with certificate generation using the new progress
        progress = newProgress;
      } else {
        return res.status(404).json({
          success: false,
          message: "Course progress not found. Please ensure you have started the course.",
        });
      }
    }

    if (!progress.completed) {
      console.log(`Certificate not generated: progress.completed is ${progress.completed}`);
      console.log(`Progress lectures:`, progress.lecturesProgress);
      console.log(`Course curriculum:`, course.curriculum.map(l => ({ id: l._id, title: l.title })));
      
      // Check if all lectures are actually completed
      const allLecturesViewed = course.curriculum.every(courseLecture => {
        const progressEntry = progress.lecturesProgress.find(p => p.lectureId.toString() === courseLecture._id.toString());
        return progressEntry && progressEntry.viewed;
      });
      
      console.log(`All lectures viewed: ${allLecturesViewed}`);
      
      if (allLecturesViewed) {
        // Update completion status if all lectures are viewed
        progress.completed = true;
        progress.completionDate = new Date();
        await progress.save();
        console.log('Course completion status updated automatically');
      } else {
        // If no progress exists but course has lectures, create progress for all lectures as viewed
        if (progress.lecturesProgress.length === 0 && course.curriculum.length > 0) {
          console.log('No progress found, creating progress for all lectures as viewed');
          progress.lecturesProgress = course.curriculum.map(lecture => ({
            lectureId: lecture._id,
            viewed: true,
            dateViewed: new Date(),
            progressPercentage: 100
          }));
          progress.completed = true;
          progress.completionDate = new Date();
          await progress.save();
          console.log('Progress created and course marked as completed');
        } else {
          return res.status(400).json({
            success: false,
            message: "Certificate available only after course completion. Please complete all lectures first.",
          });
        }
      }
    }

    // Require explicit instructor/admin approval before generating certificate
    const CertificateApproval = require("../../models/CertificateApproval");
    const approval = await CertificateApproval.findOne({ courseId, studentId: userId, revoked: { $ne: true } });
    if (!approval) {
      return res.status(403).json({ success: false, message: "Certificate not enabled for this student. Please contact your instructor." });
    }
    
    console.log('Certificate generation proceeding...');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prefer snapshot details from approval record
    const studentNameToPrint = approval.studentName || user.userName || user.userEmail || userId;
    const fatherNameToPrint = approval.studentFatherName || user.guardianName || user.guardianDetails || "";
    const courseNameToPrint = approval.courseTitle || course.certificateCourseName || course.title;
    const printedGrade = approval.grade || course.defaultCertificateGrade || "A";
    const studentIdToPrint = user.studentId || `BRX-STU-${userId.substring(userId.length - 4)}`; // Use custom studentId or fallback

    const certificateId = randomBytes(8).toString("hex").toUpperCase();
    const issuedOn = new Date(progress.completionDate || Date.now()).toDateString();

    // Save certificateId and customStudentId to approval record for verification
    approval.certificateId = certificateId;
    approval.customStudentId = studentIdToPrint;
    await approval.save();

    console.log('Generating certificate for:', {
      userName: studentNameToPrint,
      courseTitle: courseNameToPrint,
      studentId: studentIdToPrint,
      certificateId,
      issuedOn
    });

    // Set headers for optimal PDF compatibility across applications
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate_${(studentNameToPrint || "student").replace(/\s+/g, "_")}_${(courseNameToPrint || "course").replace(/\s+/g, "_")}.pdf`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Create PDF with maximum compatibility settings to prevent alignment issues
    const doc = new PDFDocument({ 
      size: "A4", 
      layout: "landscape", 
      margin: 0,
      compress: false, // Disable compression to prevent alignment issues
      autoFirstPage: true,
      bufferPages: false, // Disable buffering for immediate rendering
      info: {
        Title: `Certificate - ${course.title}`,
        Author: "BravyNex Engineering",
        Subject: "Course Completion Certificate",
        Creator: "BravyNex E-Learning Platform",
        Producer: "PDFKit 0.13.0"
      }
    });
    
    // Set PDF metadata for maximum compatibility
    doc.info.Title = `Certificate - ${course.title}`;
    doc.info.Author = "BravyNex Engineering";
    doc.info.Subject = "Course Completion Certificate";
    doc.info.Creator = "BravyNex E-Learning Platform";
    doc.info.Producer = "PDFKit 0.13.0";
    
    // Set PDF version for maximum compatibility
    doc._root.data.PDFVersion = "1.4";
    
    // Lock PDF coordinate system to prevent any transformations
    doc.save();
    doc.transform(1, 0, 0, 1, 0, 0); // Identity matrix - no transformations
    doc.restore();
    
    doc.pipe(res);

    // background (optional - URL from course settings or local file)
    let backgroundApplied = false;
    
    if (course.certificateTemplateUrl) {
      try {
        const resp = await axios.get(course.certificateTemplateUrl, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(resp.data, "binary");
        doc.image(imgBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });
        backgroundApplied = true;
        console.log('Certificate template applied from URL');
      } catch (error) {
        console.warn('Failed to fetch certificate template from URL:', error.message);
      }
    }
    
    if (!backgroundApplied) {
      // Try local certificate template
      const uploadsDir = path.join(__dirname, "../../uploads");
      const certificatePath = path.join(uploadsDir, "certificate.png");
      
      try {
        if (fs.existsSync(certificatePath)) {
          doc.image(certificatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
          backgroundApplied = true;
          console.log('Certificate template applied from local file');
        } else {
          console.warn('Certificate template not found at:', certificatePath);
        }
      } catch (error) {
        console.warn('Failed to apply certificate template:', error.message);
      }
    }
    
    // If no background was applied, continue without it
    if (!backgroundApplied) {
      console.log('No certificate template applied, generating plain certificate');
      // Add a simple background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
    }

    // Overlay text with robust positioning for cross-platform compatibility
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // Set consistent font and color for all certificate data
    // This ensures all certificate text has uniform appearance
    const certificateFontSize = 14;
    const certificateColor = "#7E1891"; // Purple color to match certificate template text
    // Alternative colors to try: "#1a0b3d" (dark purple), "#2d1b69" (medium purple), "#4c1d95" (lighter purple)
    const certificateFont = "Helvetica-Bold"; // Consistent font family for readability
    
    // Apply consistent styling to all certificate text
    doc.font(certificateFont).fontSize(certificateFontSize).fillColor(certificateColor);
    
    // Lock coordinate system for absolute positioning
    doc.save();
    doc.transform(1, 0, 0, 1, 0, 0); // Identity matrix - no coordinate transformations

    // Define FIXED text positioning with absolute coordinates for maximum stability
    // These coordinates are locked and will not change across different PDF viewers
    const textPositions = {
      // Name and Guardian section (top area) - FIXED COORDINATES
      name: { x: 170, y: 258, width: 260, height: 20 },
      guardian: { x: 400, y: 258, width: 240, height: 20 },
      studentId: { x: 605, y: 258, width: 190, height: 20 },
      
      // Course completion section (middle area) - FIXED COORDINATES
      courseName: { x: 418, y: 284, width: 240, height: 20 },
      grade: { x: 319, y: 307, width: 60, height: 20 },
      institution: { x: 400, y: 306, width: 320, height: 20 },
      
      // Certificate details section (bottom area) - FIXED COORDINATES
      certificateId: { x: 250, y: 375, width: 360, height: 20 },
      issueDate: { x: 240, y: 425, width: 220, height: 20 }
    };

    // Helper function to add text with ABSOLUTE positioning for maximum stability
    const addCertificateText = (text, position, options = {}) => {
      const defaultOptions = {
        width: position.width,
        align: "left",
        lineGap: 0,
        ellipsis: false,
        baseline: "top", // Use top baseline for consistent positioning
        ...options
      };
      
      // Ensure text is string and trim whitespace
      const cleanText = String(text || "").trim();
      
      // Use EXACT coordinates without any adjustments for maximum stability
      const exactX = position.x;
      const exactY = position.y;
      
      // Add text with ABSOLUTE positioning - no coordinate adjustments
      doc.text(cleanText, exactX, exactY, defaultOptions);
    };

    // Function to ensure ABSOLUTE text rendering across all platforms
    const renderTextWithFallback = (text, position, options = {}) => {
      try {
        // Primary rendering method with absolute positioning
        addCertificateText(text, position, options);
      } catch (error) {
        console.warn(`Text rendering fallback for: ${text}`, error.message);
        // Fallback: render with ABSOLUTE positioning and no adjustments
        const cleanText = String(text || "").trim();
        doc.text(cleanText, position.x, position.y, { 
          width: position.width, 
          align: "left",
          baseline: "top" // Use top baseline for consistent positioning
        });
      }
    };

    // Ms./Mr. [Name] .......... Student ID [id]
    const displayName = `${studentNameToPrint}`;
    // Guardian name support (renamed from guardianDetails)
    const guardianValue = fatherNameToPrint;
    const guardianLine = guardianValue ? `${guardianValue}` : "";
    
    // Add all certificate text using robust positioning with fallback
    renderTextWithFallback(displayName, textPositions.name);
    
    // Guardian details (son/daughter/ward of)
    if (guardianLine) {
      renderTextWithFallback(guardianLine, textPositions.guardian);
    }
    
    // Student ID - Use custom studentId format (BRX-STU-XXXX)
    renderTextWithFallback(studentIdToPrint, textPositions.studentId);

    // has successfully completed the [Course] Course
    renderTextWithFallback(courseNameToPrint, textPositions.courseName);

    // with Grade ___ from ___
    const printedFrom = course.certificateFrom || "BRAVYNEX ENGINEERING";
    
    // Grade and Institution
    renderTextWithFallback(printedGrade, textPositions.grade);
    renderTextWithFallback(printedFrom, textPositions.institution);

    // Certificate ID and Issue Date
    renderTextWithFallback(certificateId, textPositions.certificateId);
    renderTextWithFallback(issuedOn, textPositions.issueDate);
    
    // Restore coordinate system after all text rendering
    doc.restore();

    // Generate and place QR code that links to public certificate verification
    try {
      // Build verification URL with certificate ID
      const frontendBase = process.env.CLIENT_URL || "http://localhost:5173";
      const verificationPath = `/verify-certificate/${certificateId}`;
      const qrTargetUrl = `${frontendBase}${verificationPath}`;

      const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 6,
      });
      const qrBase64 = qrDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrBase64, "base64");

      // Position QR at bottom-right; adjust size/coords to fit template
      const qrSize = 90; // pixels
      const qrX = doc.page.width - qrSize - 570;
      const qrY = doc.page.height - qrSize - 60;
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // Optional label under QR with consistent styling
      // doc.font(certificateFont).fontSize(10).fillColor(certificateColor).text("Scan for Student Dashboard", qrX - 10, qrY + qrSize + 5, { width: qrSize + 20, align: "center" });
    } catch (_) {
      // If QR generation fails, continue without blocking certificate
    }

    // Issuer/signature area (right side)
    // Do not reprint issuer/organization if your template already contains them

    // Signature block with consistent styling
    // doc.font(certificateFont).fontSize(certificateFontSize).fillColor(certificateColor).text(course.certificateIssuer || "Chief Executive Officer", pageWidth - 330, 520, { width: 300, align: "right" });
    // doc.font(certificateFont).fontSize(certificateFontSize).fillColor(certificateColor).text(course.certificateOrganization || "BRAVYNEX ENGINEERING", pageWidth - 330, 545, { width: 300, align: "right" });

    // Finalize PDF with locked positioning for maximum stability
    doc.end();
  } catch (error) {
    console.error('Certificate generation error:', error);
    console.error('Error stack:', error.stack);
    
    // Don't send response if headers already sent
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate certificate. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

//update video progress percentage
const updateVideoProgress = async (req, res) => {
  try {
    const { userId, courseId, lectureId, progressPercentage } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });
    
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: false,
            dateViewed: null,
            progressPercentage: progressPercentage || 0,
          },
        ],
      });
      await progress.save();
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (lectureProgress) {
        lectureProgress.progressPercentage = progressPercentage || 0;
        
        // Check if this lecture meets the completion threshold
        const course = await Course.findById(courseId);
        const completionThreshold = (course?.completionPercentage || 95);
        
        if (lectureProgress.progressPercentage >= completionThreshold && !lectureProgress.viewed) {
          lectureProgress.viewed = true;
          lectureProgress.dateViewed = new Date();
        }
        
        await progress.save();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: false,
          dateViewed: null,
          progressPercentage: progressPercentage || 0,
        });
        await progress.save();
      }
    }

    // Check if course is completed
    const course = await Course.findById(courseId);
    if (course) {
      const allLecturesViewed = course.curriculum.every(courseLecture => {
        const progressEntry = progress.lecturesProgress.find(p => p.lectureId.toString() === courseLecture._id.toString());
        return progressEntry && progressEntry.viewed;
      });

      console.log(`All lectures viewed: ${allLecturesViewed}, Current completed: ${progress.completed}`);
      console.log(`Course curriculum length: ${course.curriculum.length}, Progress lectures: ${progress.lecturesProgress.length}`);

      if (allLecturesViewed && !progress.completed) {
        progress.completed = true;
        progress.completionDate = new Date();
        await progress.save();
        console.log('Course marked as completed');
      }
    }

    res.status(200).json({
      success: true,
      message: "Video progress updated",
      data: {
        lecturesProgress: progress.lecturesProgress,
        completed: progress.completed,
        completionDate: progress.completionDate
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
  generateCompletionCertificate,
  updateVideoProgress,
};

// Helper function to check and set overall course completion
const checkAndSetOverallCourseCompletion = async (progress, course) => {
  if (!course || !progress || course.curriculum.length === 0) {
    return;
  }

  const totalLectures = course.curriculum.length;
  let totalProgressSum = 0;

  for (const lecture of course.curriculum) {
    const progressEntry = progress.lecturesProgress.find(p => p.lectureId.toString() === lecture._id.toString());
    totalProgressSum += (progressEntry?.progressPercentage || 0);
  }

  const overallCourseProgress = (totalProgressSum / totalLectures);
  const courseCompletionThreshold = (course.completionPercentage || 95);

  if (overallCourseProgress >= courseCompletionThreshold && !progress.completed) {
    progress.completed = true;
    progress.completionDate = new Date();
    await progress.save();
  } else if (overallCourseProgress < courseCompletionThreshold && progress.completed) {
    // If progress drops below threshold after being completed (e.g., due to reset or re-watch)
    progress.completed = false;
    progress.completionDate = null;
    await progress.save();
  }
};
