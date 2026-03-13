const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const { validatePasswordStrength, validateEmail, markSuspiciousIP } = require("../../middleware/security-middleware");

// Enhanced user registration with comprehensive security
const secureRegisterUser = async (req, res) => {
  console.log("=== SECURE REGISTRATION REQUEST ===");
  console.log("IP:", req.ip, "User-Agent:", req.headers['user-agent']);
  
  const { userName, userEmail, password, dob, guardianName } = req.body || {};
  
  // Comprehensive input validation
  if (!userName || !userEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userName, userEmail, and password are required",
      code: "MISSING_FIELDS"
    });
  }

  // Email validation with security checks
  const emailValidation = validateEmail(userEmail);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.message,
      code: "INVALID_EMAIL"
    });
  }

  // Username validation - trim and validate
  const trimmedUserName = userName ? userName.trim() : '';
  
  // Check if username is empty after trimming
  if (!trimmedUserName) {
    return res.status(400).json({
      success: false,
      message: "Username cannot be empty or contain only spaces",
      code: "EMPTY_USERNAME"
    });
  }

  // Check length after trimming
  if (!validator.isLength(trimmedUserName, { min: 3, max: 30 })) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 30 characters (spaces will be trimmed)",
      code: "INVALID_USERNAME_LENGTH"
    });
  }

  // Check for suspicious username patterns (case insensitive)
  if (/(admin|root|system|test|demo)/i.test(trimmedUserName)) {
    return res.status(400).json({
      success: false,
      message: "Username contains restricted words",
      code: "RESTRICTED_USERNAME"
    });
  }

  // Check for excessive spaces or special characters
  if (/\s{2,}/.test(trimmedUserName) || /[<>\"'&]/.test(trimmedUserName)) {
    return res.status(400).json({
      success: false,
      message: "Username contains invalid characters or excessive spaces",
      code: "INVALID_USERNAME_FORMAT"
    });
  }

  // Password strength validation
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Password does not meet security requirements",
      code: "WEAK_PASSWORD",
      requirements: passwordValidation.requirements
    });
  }

  // Date of birth validation
  let parsedDob = undefined;
  if (dob) {
    const dateObj = new Date(dob);
    if (isNaN(dateObj.getTime()) || dateObj > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
        code: "INVALID_DOB"
      });
    }
    parsedDob = dateObj;
  }

  // Guardian name validation
  const safeGuardianDetails = guardianName
    ? validator.escape(guardianName.trim())
    : undefined;

  if (safeGuardianDetails && !validator.isLength(safeGuardianDetails, { min: 2, max: 50 })) {
    return res.status(400).json({
      success: false,
      message: "Guardian name must be between 2 and 50 characters",
      code: "INVALID_GUARDIAN_NAME"
    });
  }

  try {
    // Check for existing user with enhanced security
    const existingUser = await User.findOne({
      $or: [
        { userEmail: emailValidation.normalizedEmail },
        { userName: trimmedUserName }
      ],
    }).lean();

    if (existingUser) {
      // Don't reveal which field already exists for security
      return res.status(400).json({
        success: false,
        message: "An account with this information already exists",
        code: "USER_EXISTS"
      });
    }

    // Optimized password hashing - 10 rounds is secure and faster
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create user with security fields
    const newUser = new User({
      userName: trimmedUserName,
      userEmail: emailValidation.normalizedEmail,
      role: "user",
      password: hashPassword,
      dob: parsedDob,
      guardianDetails: safeGuardianDetails,
      // Security tracking fields
      registrationIP: req.ip,
      registrationUserAgent: req.headers['user-agent'],
      lastLoginIP: null,
      lastLoginUserAgent: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      isEmailVerified: false,
      createdAt: new Date(),
    });

    await newUser.save();
    
    console.log("✅ Secure user registration successful:", {
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      id: newUser._id,
      ip: req.ip
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully! Please verify your email.",
      code: "REGISTRATION_SUCCESS"
    });

  } catch (error) {
    console.error("Secure registration error:", error);
    
    // Handle specific database errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + validationErrors.join(', '),
        code: "VALIDATION_ERROR"
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "An account with this information already exists",
        code: "USER_EXISTS"
      });
    }
    
    // Don't expose internal errors in production
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? `Internal server error: ${error.message}` 
        : "Internal server error during registration",
      code: "INTERNAL_ERROR"
    });
  }
};

// Enhanced login with brute force protection
const secureLoginUser = async (req, res) => {
  const { userEmail, password } = req.body || {};
  const clientIP = req.ip;
  const userAgent = req.headers['user-agent'];

  console.log("=== SECURE LOGIN ATTEMPT ===");
  console.log("IP:", clientIP, "User-Agent:", userAgent);

  // Input validation
  const emailValidation = validateEmail(userEmail);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
      code: "INVALID_EMAIL"
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
      code: "MISSING_PASSWORD"
    });
  }

  try {
    // Optimized query - only fetch needed fields
    const user = await User.findOne({ userEmail: emailValidation.normalizedEmail })
      .select('+password +failedLoginAttempts +accountLockedUntil +lastLoginIP +lastLoginUserAgent');

    if (!user) {
      // Simulate password check timing to prevent user enumeration
      await bcrypt.compare(password, "$2a$10$dummy.hash.to.prevent.timing.attacks");
      
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked due to multiple failed attempts",
        code: "ACCOUNT_LOCKED",
        lockedUntil: user.accountLockedUntil
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        
        // Mark IP as suspicious
        markSuspiciousIP(clientIP, 60 * 60 * 1000); // 1 hour
        
        return res.status(423).json({
          success: false,
          message: "Account locked due to multiple failed attempts. Try again in 30 minutes.",
          code: "ACCOUNT_LOCKED"
        });
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
        attemptsLeft: 5 - user.failedLoginAttempts
      });
    }

    // Successful login - update all fields in single query for better performance
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
          lastLoginIP: clientIP,
          lastLoginUserAgent: userAgent,
          lastLoginAt: new Date()
        }
      }
    );

    // Generate secure JWT token
    const tokenPayload = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      loginIP: clientIP,
      loginTime: new Date(),
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "JWT_SECRET",
      { 
        expiresIn: "2h",
        issuer: "bravynex-platform",
        audience: "bravynex-users"
      }
    );

    // Set secure cookie for token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    console.log("✅ Secure login successful:", {
      userId: user._id,
      userName: user.userName,
      ip: clientIP
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      code: "LOGIN_SUCCESS",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
        },
      },
    });

  } catch (error) {
    console.error("Secure login error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
      code: "INTERNAL_ERROR"
    });
  }
};

// Enhanced password reset with OTP security
const secureInitiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const clientIP = req.ip;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        code: "INVALID_EMAIL"
      });
    }

    // Check if user exists (don't reveal if email exists)
    const user = await User.findOne({ userEmail: emailValidation.normalizedEmail });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
        code: "RESET_EMAIL_SENT"
      });
    }

    // Generate secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Store OTP with security metadata
    user.passwordResetOTP = otpHash;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.passwordResetIP = clientIP;
    user.passwordResetAttempts = 0;
    await user.save();

    // Send OTP email (implement your email service)
    // await sendSecureOTPEmail({ email: emailValidation.normalizedEmail, otp });

    console.log("✅ Password reset OTP generated:", {
      email: emailValidation.normalizedEmail,
      ip: clientIP,
      expiresAt: user.passwordResetExpires
    });

    return res.status(200).json({
      success: true,
      message: "If an account with this email exists, a password reset OTP has been sent.",
      code: "RESET_OTP_SENT"
    });

  } catch (error) {
    console.error("Password reset initiation error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error during password reset",
      code: "INTERNAL_ERROR"
    });
  }
};

// Enhanced password reset verification
const secureVerifyPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const clientIP = req.ip;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        code: "INVALID_EMAIL"
      });
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        code: "WEAK_PASSWORD",
        requirements: passwordValidation.requirements
      });
    }

    const user = await User.findOne({ userEmail: emailValidation.normalizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
        code: "INVALID_RESET_REQUEST"
      });
    }

    // Check OTP expiry
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Password reset OTP has expired",
        code: "OTP_EXPIRED"
      });
    }

    // Check IP address (additional security)
    if (user.passwordResetIP !== clientIP) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
        code: "INVALID_RESET_REQUEST"
      });
    }

    // Verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (user.passwordResetOTP !== otpHash) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      
      if (user.passwordResetAttempts >= 3) {
        // Clear reset data after too many attempts
        user.passwordResetOTP = null;
        user.passwordResetExpires = null;
        user.passwordResetIP = null;
        user.passwordResetAttempts = 0;
        await user.save();
        
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP",
          code: "TOO_MANY_ATTEMPTS"
        });
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        code: "INVALID_OTP",
        attemptsLeft: 3 - user.passwordResetAttempts
      });
    }

    // Update password - optimized salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    user.passwordResetOTP = null;
    user.passwordResetExpires = null;
    user.passwordResetIP = null;
    user.passwordResetAttempts = 0;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    console.log("✅ Password reset successful:", {
      userId: user._id,
      email: emailValidation.normalizedEmail,
      ip: clientIP
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      code: "PASSWORD_RESET_SUCCESS"
    });

  } catch (error) {
    console.error("Password reset verification error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error during password reset",
      code: "INTERNAL_ERROR"
    });
  }
};

module.exports = {
  secureRegisterUser,
  secureLoginUser,
  secureInitiatePasswordReset,
  secureVerifyPasswordReset,
};
