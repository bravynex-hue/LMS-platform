const validator = require("validator");
const crypto = require("crypto");
const { validateEmail, markSuspiciousIP } = require("../middleware/security-middleware");

// Enhanced contact form submission with comprehensive security
const secureContactSubmission = async (req, res) => {
  console.log("=== SECURE CONTACT FORM SUBMISSION ===");
  console.log("IP:", req.ip, "User-Agent:", req.headers['user-agent']);
  
  const {
    fromName,
    fromEmail,
    phoneNumber,
    course,
    segment,
    institution,
    message,
    subject
  } = req.body || {};

  // Comprehensive input validation
  const validationErrors = [];

  // Name validation
  if (!fromName || typeof fromName !== 'string') {
    validationErrors.push("Name is required");
  } else if (!validator.isLength(fromName.trim(), { min: 2, max: 50 })) {
    validationErrors.push("Name must be between 2 and 50 characters");
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(fromName.trim())) {
    validationErrors.push("Name contains invalid characters");
  }

  // Email validation
  const emailValidation = validateEmail(fromEmail);
  if (!emailValidation.isValid) {
    validationErrors.push(emailValidation.message);
  }

  // Phone number validation (optional but if provided, must be valid)
  if (phoneNumber && phoneNumber.trim()) {
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    if (!validator.isMobilePhone(cleanPhone, 'any', { strictMode: true })) {
      validationErrors.push("Invalid phone number format");
    }
  }

  // Course validation
  if (course && !validator.isLength(course, { max: 100 })) {
    validationErrors.push("Course name is too long");
  }

  // Segment validation
  const validSegments = ['Student', 'Professional', 'Educator', 'Corporate', 'Other'];
  if (segment && !validSegments.includes(segment)) {
    validationErrors.push("Invalid segment selection");
  }

  // Institution validation
  if (institution && !validator.isLength(institution.trim(), { max: 100 })) {
    validationErrors.push("Institution name is too long");
  }

  // Message validation
  if (!message || typeof message !== 'string') {
    validationErrors.push("Message is required");
  } else if (!validator.isLength(message.trim(), { min: 10, max: 1000 })) {
    validationErrors.push("Message must be between 10 and 1000 characters");
  }

  // Check for spam patterns in message
  const spamPatterns = [
    /(click here|buy now|free money|make money|work from home)/i,
    /(viagra|casino|poker|lottery)/i,
    /(http|www\.|\.com|\.net|\.org)/i,
    /(bitcoin|cryptocurrency|investment)/i
  ];

  if (spamPatterns.some(pattern => pattern.test(message))) {
    validationErrors.push("Message contains prohibited content");
    // Mark IP as suspicious for spam
    markSuspiciousIP(req.ip, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Check for excessive special characters (potential spam)
  const specialCharCount = (message.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCharCount > message.length * 0.3) {
    validationErrors.push("Message contains too many special characters");
  }

  // Check for repeated characters (potential spam)
  if (/(.)\1{4,}/.test(message)) {
    validationErrors.push("Message contains excessive repeated characters");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
      code: "VALIDATION_ERROR"
    });
  }

  try {
    // Sanitize all inputs
    const sanitizedData = {
      fromName: validator.escape(fromName.trim()),
      fromEmail: emailValidation.normalizedEmail,
      phoneNumber: phoneNumber ? validator.escape(phoneNumber.trim()) : null,
      course: course ? validator.escape(course.trim()) : null,
      segment: segment ? validator.escape(segment.trim()) : null,
      institution: institution ? validator.escape(institution.trim()) : null,
      message: validator.escape(message.trim()),
      subject: subject || "Website Contact Form Submission",
      // Security metadata
      submissionIP: req.ip,
      submissionUserAgent: req.headers['user-agent'],
      submissionTimestamp: new Date(),
      submissionId: crypto.randomUUID(),
    };

    // Check for duplicate submissions (same email + similar message within 1 hour)
    // This would require a database to store submissions
    // For now, we'll implement basic rate limiting through middleware

    // Log the submission for security monitoring
    console.log("✅ Secure contact form submission:", {
      submissionId: sanitizedData.submissionId,
      fromName: sanitizedData.fromName,
      fromEmail: sanitizedData.fromEmail,
      ip: sanitizedData.submissionIP,
      timestamp: sanitizedData.submissionTimestamp
    });

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send auto-reply to user
    // 4. Log for security monitoring

    // Simulate email sending
    // await sendContactFormEmail(sanitizedData);
    // await sendAutoReplyEmail(sanitizedData);

    return res.status(200).json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
      submissionId: sanitizedData.submissionId,
      code: "SUBMISSION_SUCCESS"
    });

  } catch (error) {
    console.error("Contact form submission error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      code: "INTERNAL_ERROR"
    });
  }
};

// Email validation endpoint (for real-time validation)
const validateContactEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      code: "MISSING_EMAIL"
    });
  }

  const emailValidation = validateEmail(email);
  
  return res.status(200).json({
    success: true,
    isValid: emailValidation.isValid,
    message: emailValidation.message,
    normalizedEmail: emailValidation.normalizedEmail
  });
};

// Contact form analytics (for monitoring)
const getContactFormStats = async (req, res) => {
  // This would typically require authentication and admin privileges
  // For now, return basic stats
  
  const stats = {
    totalSubmissions: 0, // Would come from database
    spamBlocked: 0,
    last24Hours: 0,
    topSegments: [],
    topCourses: []
  };

  return res.status(200).json({
    success: true,
    data: stats
  });
};

module.exports = {
  secureContactSubmission,
  validateContactEmail,
  getContactFormStats,
};
