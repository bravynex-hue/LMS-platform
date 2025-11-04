const Course = require("../../models/Course");
const User = require("../../models/User");
const { securityLogger } = require("../../middleware/security-middleware");
const { uploadMediaBufferToCloudinary, uploadLargeBufferToCloudinary } = require("../../helpers/cloudinary");
const validator = require("validator");
const { randomBytes } = require("crypto");

// Input validation schemas
const courseValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
    sanitize: true
  },
  subtitle: {
    required: false,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
    sanitize: true
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    sanitize: true
  },
  price: {
    required: true,
    type: 'number',
    min: 0,
    max: 10000
  },
  category: {
    required: true,
    enum: ['programming', 'design', 'business', 'marketing', 'photography', 'music', 'other'],
    sanitize: true
  },
  level: {
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    sanitize: true
  },
  language: {
    required: true,
    pattern: /^[a-zA-Z\s]+$/,
    sanitize: true
  },
  duration: {
    required: true,
    type: 'number',
    min: 1,
    max: 1000
  },
  image: {
    required: false,
    type: 'url',
    pattern: /^https:\/\/res\.cloudinary\.com\/.*$/
  }
};

const curriculumValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
    sanitize: true
  },
  videoUrl: {
    required: true,
    type: 'url',
    pattern: /^https:\/\/res\.cloudinary\.com\/.*$/
  },
  public_id: {
    required: true,
    pattern: /^[a-zA-Z0-9_\-/]+$/,
    sanitize: true
  },
  duration: {
    required: false,
    type: 'number',
    min: 1,
    max: 3600
  },
  freePreview: {
    required: false,
    type: 'boolean'
  }
};

// Sanitization function
const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') return input;
  
  let sanitized = input;
  
  if (options.sanitize) {
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    sanitized = sanitized
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  
  return sanitized;
};

// Validation function
const validateInput = (value, schema, fieldName) => {
  const errors = [];
  
  // Required check
  if (schema.required && (!value || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }
  
  // Skip other validations if value is empty and not required
  if (!value || value === '') return errors;
  
  // Type validation
  if (schema.type === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      errors.push(`${fieldName} must be a valid number`);
    } else {
      if (schema.min !== undefined && num < schema.min) {
        errors.push(`${fieldName} must be at least ${schema.min}`);
      }
      if (schema.max !== undefined && num > schema.max) {
        errors.push(`${fieldName} must be at most ${schema.max}`);
      }
    }
  }
  
  if (schema.type === 'boolean') {
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      errors.push(`${fieldName} must be a boolean value`);
    }
  }
  
  if (schema.type === 'url') {
    if (!validator.isURL(value)) {
      errors.push(`${fieldName} must be a valid URL`);
    }
  }
  
  // String validations
  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${fieldName} must be at least ${schema.minLength} characters`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${fieldName} must be at most ${schema.maxLength} characters`);
    }
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push(`${fieldName} contains invalid characters`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${schema.enum.join(', ')}`);
    }
  }
  
  return errors;
};

// Validate course data
const validateCourseData = (courseData) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(courseData)) {
    const schema = courseValidationSchema[field];
    if (schema) {
      const fieldErrors = validateInput(value, schema, field);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors[0];
      }
    }
  }
  
  return errors;
};

// Validate curriculum data
const validateCurriculumData = (curriculumData) => {
  const errors = {};
  
  if (!Array.isArray(curriculumData)) {
    return { curriculum: 'Curriculum must be an array' };
  }
  
  if (curriculumData.length === 0) {
    return { curriculum: 'At least one lecture is required' };
  }
  
  let hasFreePreview = false;
  
  for (let i = 0; i < curriculumData.length; i++) {
    const lecture = curriculumData[i];
    const lectureErrors = {};
    
    for (const [field, value] of Object.entries(lecture)) {
      const schema = curriculumValidationSchema[field];
      if (schema) {
        const fieldErrors = validateInput(value, schema, field);
        if (fieldErrors.length > 0) {
          lectureErrors[field] = fieldErrors[0];
        }
      }
    }
    
    if (lecture.freePreview) {
      hasFreePreview = true;
    }
    
    if (Object.keys(lectureErrors).length > 0) {
      errors[`lecture_${i}`] = lectureErrors;
    }
  }
  
  if (!hasFreePreview) {
    errors.curriculum = 'At least one lecture must be marked as free preview';
  }
  
  return errors;
};

// Secure course creation
const secureCreateCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseData = req.body;
    
    // Log course creation attempt
    securityLogger.info('Course creation attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      courseTitle: courseData.title
    });
    
    // Validate course data
    const courseErrors = validateCourseData(courseData);
    if (Object.keys(courseErrors).length > 0) {
      securityLogger.warn('Course creation blocked - validation failed', {
        ip: req.ip,
        userId,
        errors: courseErrors
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: courseErrors
      });
    }
    
    // Validate curriculum data
    const curriculumErrors = validateCurriculumData(courseData.curriculum);
    if (Object.keys(curriculumErrors).length > 0) {
      securityLogger.warn('Course creation blocked - curriculum validation failed', {
        ip: req.ip,
        userId,
        errors: curriculumErrors
      });
      return res.status(400).json({
        success: false,
        message: 'Curriculum validation failed',
        errors: curriculumErrors
      });
    }
    
    // Sanitize course data
    const sanitizedCourseData = {};
    for (const [field, value] of Object.entries(courseData)) {
      const schema = courseValidationSchema[field];
      if (schema) {
        sanitizedCourseData[field] = sanitizeInput(value, schema);
      } else {
        sanitizedCourseData[field] = value;
      }
    }
    
    // Sanitize curriculum data
    const sanitizedCurriculum = courseData.curriculum.map(lecture => {
      const sanitizedLecture = {};
      for (const [field, value] of Object.entries(lecture)) {
        const schema = curriculumValidationSchema[field];
        if (schema) {
          sanitizedLecture[field] = sanitizeInput(value, schema);
        } else {
          sanitizedLecture[field] = value;
        }
      }
      return sanitizedLecture;
    });
    
    // Create course
    const course = new Course({
      ...sanitizedCourseData,
      curriculum: sanitizedCurriculum,
      instructorId: userId,
      instructorName: req.user.userName,
      date: new Date(),
      students: [],
      isPublished: true
    });
    
    await course.save();
    
    securityLogger.info('Course created successfully', {
      ip: req.ip,
      userId,
      courseId: course._id,
      courseTitle: course.title
    });
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
    
  } catch (error) {
    securityLogger.error('Course creation error', {
      ip: req.ip,
      userId: req.user?.id,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
};

// Secure course update
const secureUpdateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    // Log course update attempt
    securityLogger.info('Course update attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      courseId,
      updateFields: Object.keys(updateData)
    });
    
    // Find course and verify ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructorId.toString() !== userId) {
      securityLogger.warn('Course update blocked - unauthorized access', {
        ip: req.ip,
        userId,
        courseId,
        courseInstructorId: course.instructorId
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Validate update data
    const courseErrors = validateCourseData(updateData);
    if (Object.keys(courseErrors).length > 0) {
      securityLogger.warn('Course update blocked - validation failed', {
        ip: req.ip,
        userId,
        courseId,
        errors: courseErrors
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: courseErrors
      });
    }
    
    // Validate curriculum if provided
    if (updateData.curriculum) {
      const curriculumErrors = validateCurriculumData(updateData.curriculum);
      if (Object.keys(curriculumErrors).length > 0) {
        securityLogger.warn('Course update blocked - curriculum validation failed', {
          ip: req.ip,
          userId,
          courseId,
          errors: curriculumErrors
        });
        return res.status(400).json({
          success: false,
          message: 'Curriculum validation failed',
          errors: curriculumErrors
        });
      }
    }
    
    // Sanitize update data
    const sanitizedUpdateData = {};
    for (const [field, value] of Object.entries(updateData)) {
      const schema = courseValidationSchema[field];
      if (schema) {
        sanitizedUpdateData[field] = sanitizeInput(value, schema);
      } else {
        sanitizedUpdateData[field] = value;
      }
    }
    
    // Sanitize curriculum if provided
    if (updateData.curriculum) {
      sanitizedUpdateData.curriculum = updateData.curriculum.map(lecture => {
        const sanitizedLecture = {};
        for (const [field, value] of Object.entries(lecture)) {
          const schema = curriculumValidationSchema[field];
          if (schema) {
            sanitizedLecture[field] = sanitizeInput(value, schema);
          } else {
            sanitizedLecture[field] = value;
          }
        }
        return sanitizedLecture;
      });
    }
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      sanitizedUpdateData,
      { new: true, runValidators: true }
    );
    
    securityLogger.info('Course updated successfully', {
      ip: req.ip,
      userId,
      courseId,
      updatedFields: Object.keys(sanitizedUpdateData)
    });
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
    
  } catch (error) {
    securityLogger.error('Course update error', {
      ip: req.ip,
      userId: req.user?.id,
      courseId: req.params.courseId,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
};

// Secure course deletion
const secureDeleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Log course deletion attempt
    securityLogger.info('Course deletion attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      courseId
    });
    
    // Find course and verify ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructorId.toString() !== userId) {
      securityLogger.warn('Course deletion blocked - unauthorized access', {
        ip: req.ip,
        userId,
        courseId,
        courseInstructorId: course.instructorId
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Delete course
    await Course.findByIdAndDelete(courseId);
    
    securityLogger.info('Course deleted successfully', {
      ip: req.ip,
      userId,
      courseId,
      courseTitle: course.title
    });
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
    
  } catch (error) {
    securityLogger.error('Course deletion error', {
      ip: req.ip,
      userId: req.user?.id,
      courseId: req.params.courseId,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

// Secure media upload
const secureMediaUpload = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Log media upload attempt
    securityLogger.info('Media upload attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Additional file validation
    const file = req.file;
    
    // Check file size (additional check)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      securityLogger.warn('Media upload blocked - file too large', {
        ip: req.ip,
        userId,
        filename: file.originalname,
        size: file.size,
        maxSize
      });
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    
    // Check MIME type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      securityLogger.warn('Media upload blocked - invalid MIME type', {
        ip: req.ip,
        userId,
        filename: file.originalname,
        mimetype: file.mimetype
      });
      return res.status(400).json({
        success: false,
        message: 'File type not allowed'
      });
    }
    
    // Upload to Cloudinary
    const isVideo = file.mimetype.startsWith('video/');
    const result = isVideo
      ? await uploadLargeBufferToCloudinary(file.buffer, undefined, { resource_type: 'video' })
      : await uploadMediaBufferToCloudinary(file.buffer, undefined, { resource_type: 'auto' });
    
    securityLogger.info('Media upload successful', {
      ip: req.ip,
      userId,
      filename: file.originalname,
      cloudinaryId: result.public_id,
      url: result.url
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    securityLogger.error('Media upload error', {
      ip: req.ip,
      userId: req.user?.id,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
};

// Secure bulk media upload
const secureBulkMediaUpload = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Log bulk media upload attempt
    securityLogger.info('Bulk media upload attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      fileCount: req.files.length
    });
    
    // Validate each file
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
    ];
    
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    
    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        securityLogger.warn('Bulk media upload blocked - invalid MIME type', {
          ip: req.ip,
          userId,
          filename: file.originalname,
          mimetype: file.mimetype
        });
        return res.status(400).json({
          success: false,
          message: `File type not allowed: ${file.originalname}`
        });
      }
      
      if (file.size > maxSize) {
        securityLogger.warn('Bulk media upload blocked - file too large', {
          ip: req.ip,
          userId,
          filename: file.originalname,
          size: file.size,
          maxSize
        });
        return res.status(400).json({
          success: false,
          message: `File too large: ${file.originalname}`
        });
      }
    }
    
    // Upload all files
    const uploadPromises = req.files.map((file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return isVideo
        ? uploadLargeBufferToCloudinary(file.buffer, undefined, { resource_type: 'video' })
        : uploadMediaBufferToCloudinary(file.buffer, undefined, { resource_type: 'auto' });
    });
    
    const results = await Promise.all(uploadPromises);
    
    securityLogger.info('Bulk media upload successful', {
      ip: req.ip,
      userId,
      fileCount: req.files.length,
      results: results.map(r => r.public_id)
    });
    
    res.status(200).json({
      success: true,
      data: results
    });
    
  } catch (error) {
    securityLogger.error('Bulk media upload error', {
      ip: req.ip,
      userId: req.user?.id,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload media files'
    });
  }
};

module.exports = {
  secureCreateCourse,
  secureUpdateCourse,
  secureDeleteCourse,
  secureMediaUpload,
  secureBulkMediaUpload,
  validateCourseData,
  validateCurriculumData,
  sanitizeInput
};
