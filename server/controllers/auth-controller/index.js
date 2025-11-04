const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { generateUniqueStudentId } = require("../../helpers/studentIdGenerator");


const registerUser = async (req, res) => {
  console.log("=== REGISTRATION REQUEST ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { userName, userEmail, password, dob, guardianName } = req.body || {};
  const normalizedUserName = (userName + "").trim().replace(/\s+/g, ' ');
  
  console.log("Extracted fields:", { userName, userEmail, password: password ? "present" : "missing" });

  // Validate required fields
  if (!normalizedUserName || !userEmail || !password) {
    console.log("❌ Missing required fields:", { 
      userName: normalizedUserName || "MISSING", 
      userEmail: userEmail || "MISSING", 
      password: password ? "present" : "MISSING" 
    });
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userName, userEmail, and password are required",
      missingFields: {
        userName: !userName,
        userEmail: !userEmail,
      password: !password
      }
    });
  }

  // Normalize & validate
  const normalizedEmail = validator.normalizeEmail(userEmail + "");
  if (!validator.isEmail(normalizedEmail || "")) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  // Username validation: alphabets and spaces only, 3–13 chars
  if (!validator.isLength(normalizedUserName + "", { min: 3, max: 13 })) {
    return res.status(400).json({ success: false, message: "Name must be 3-13 characters" });
  }
  if (!/^[A-Za-z\s]+$/.test(normalizedUserName)) {
    return res.status(400).json({ success: false, message: "Name can contain only letters and spaces" });
  }
  if (!validator.isStrongPassword(password + "", { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
    return res.status(400).json({ success: false, message: "Weak password: include upper, lower, number, special symbol, min 8" });
  }

  // Optional validations
  let parsedDob = undefined;
  if (dob) {
    const dateObj = new Date(dob);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date of birth" });
    }
    
    // Validate that date of birth is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dobDate = new Date(dateObj);
    dobDate.setHours(0, 0, 0, 0);
    
    if (dobDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: "Date of birth cannot be in the future" 
      });
    }
    
    parsedDob = dateObj;
  }
  const safeGuardianDetails = guardianName
    ? validator.escape(guardianName + "")
    : undefined;

    try {
    const existingUser = await User.findOne({
      $or: [{ userEmail: normalizedEmail }, { userName: normalizedUserName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User name or user email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    
    // Generate unique student ID for users with 'user' role
    const studentId = await generateUniqueStudentId();
    
    const newUser = new User({
      // Preserve single spaces; model validation trims
      userName: normalizedUserName,
      userEmail: normalizedEmail,
      role: "user",
      password: hashPassword,
      dob: parsedDob,
      guardianDetails: safeGuardianDetails,
      studentId: studentId, // Assign custom student ID
    });

    await newUser.save();
    
    console.log("✅ User registered successfully:", {
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      id: newUser._id,
      studentId: newUser.studentId
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    // Duplicate key error (unique index)
    if (error && (error.code === 11000 || error.code === 11001)) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `${field === 'userEmail' ? 'Email' : 'Username'} already exists`,
        field,
      });
    }
    // Mongoose validation error
    if (error && error.name === 'ValidationError') {
      const details = Object.fromEntries(
        Object.entries(error.errors || {}).map(([k, v]) => [k, v?.message || 'Invalid value'])
      );
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

const loginUser = async (req, res) => {
  const { userEmail, password } = req.body || {};
  const normalizedEmail = validator.normalizeEmail(userEmail + "");
  if (!validator.isEmail(normalizedEmail || "")) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }
  if (!password || !validator.isLength(password + "", { min: 6 })) {
    return res.status(400).json({ success: false, message: "Password required" });
  }

  const checkUser = await User.findOne({ userEmail: normalizedEmail });

  if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
    return res.status(401).json({
      success: false,
      message: "Wrong email or password",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    process.env.JWT_SECRET || "JWT_SECRET",
    { expiresIn: "120m" }
  );

  // TODO: Implement notification system
  console.log(`User ${checkUser.userName} logged in successfully at ${new Date()}`);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};

module.exports = { registerUser, loginUser };
