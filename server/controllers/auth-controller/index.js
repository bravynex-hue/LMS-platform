const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { generateUniqueStudentId } = require("../../helpers/studentIdGenerator");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const registerUser = async (req, res) => {
  const { userName, userEmail, password, dob, guardianName } = req.body || {};
  const normalizedUserName = (userName + "").trim().replace(/\s+/g, ' ');

  // Validate required fields
  if (!normalizedUserName || !userEmail || !password) {
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

  if (!checkUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // If user exists but has no password, they likely used Google/GitHub to sign up
  if (!checkUser.password) {
    return res.status(401).json({
      success: false,
      message: "This account uses social login. Please sign in with Google or GitHub.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, checkUser.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password",
    });
  }

  const payload = {
    _id: checkUser._id,
    userName: checkUser.userName,
    userEmail: checkUser.userEmail,
    role: checkUser.role,
    studentId: checkUser.studentId,
    guardianDetails: checkUser.guardianDetails,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || "JWT_SECRET",
    { expiresIn: "15m" } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { _id: checkUser._id },
    process.env.JWT_REFRESH_SECRET || "JWT_REFRESH_SECRET",
    { expiresIn: "7d" }
  );

  // Store active session in database (Requirement 4)
  await checkUser.addActiveSession({
    tokenId: refreshToken.substring(refreshToken.length - 20),
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Set HTTP-only cookie for refresh token (Requirement 4)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

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
        studentId: checkUser.studentId,
        avatar: checkUser.avatar,
        guardianDetails: checkUser.guardianDetails,
      },
    },
  });
};

const googleLogin = async (req, res) => {
  const { idToken, accessToken, mode = "signin" } = req.body || {};

  if (!idToken && !accessToken) {
    return res.status(400).json({
      success: false,
      message: "Google ID Token or Access Token is required",
    });
  }

  try {
    let email, name, picture, googleId;

    if (idToken) {
      // Standard ID Token verification
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else {
      // Access Token flow - fetch from userinfo endpoint
      const axios = require("axios");
      const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = googleResponse.data;
      email = data.email;
      name = data.name;
      picture = data.picture;
      googleId = data.sub;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by Google",
      });
    }

    let user = await User.findOne({ userEmail: email.toLowerCase() });

    if (user) {
      // User exists
      const isNewUser = !user.providerId; // If providerId wasn't set, it's their first time with Google
      if (isNewUser) {
        user.provider = "google";
        user.providerId = googleId;
        user.avatar = user.avatar || picture;
        await user.save();
      }

      const token = jwt.sign(
        {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          studentId: user.studentId,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET || "JWT_SECRET",
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "User already exists", 
        data: {
          accessToken: token,
          user: {
            _id: user._id,
            userName: user.userName,
            userEmail: user.userEmail,
            role: user.role,
            studentId: user.studentId,
            avatar: user.avatar,
          },
        },
      });
    } else {
      // User doesn't exist
      if (mode === "signin") {
        return res.status(404).json({
          success: false,
          message: "Account not found. Please sign up to create a new account.",
        });
      }

      // New user registration (only allowed if mode is 'signup')
      const studentId = await generateUniqueStudentId();
      
      let baseUserName = (name || email.split("@")[0]).trim().replace(/\s+/g, "_").toLowerCase();
      let uniqueUserName = baseUserName.substring(0, 13);
      
      const isUserNameTaken = await User.findOne({ userName: uniqueUserName });
      if (isUserNameTaken) {
        uniqueUserName = `${baseUserName.substring(0, 9)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = new User({
        userName: uniqueUserName,
        userEmail: email.toLowerCase(),
        role: "user",
        provider: "google",
        providerId: googleId,
        avatar: picture,
        studentId: studentId,
        isEmailVerified: true,
      });

      await user.save();

      const token = jwt.sign(
        {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          studentId: user.studentId,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET || "JWT_SECRET",
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          accessToken: token,
          user: {
            _id: user._id,
            userName: user.userName,
            userEmail: user.userEmail,
            role: user.role,
            studentId: user.studentId,
            avatar: user.avatar,
          },
        },
      });
    }
  } catch (error) {
    console.error("❌ Google login error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "JWT_REFRESH_SECRET");
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(403).json({ success: false, message: "Invalid user" });
    }

    // Verify token exists in active sessions
    const tokenId = refreshToken.substring(refreshToken.length - 20);
    const sessionExists = user.activeSessions.some(s => s.tokenId === tokenId);
    
    if (!sessionExists) {
      return res.status(403).json({ success: false, message: "Session expired or revoked" });
    }

    const newPayload = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      studentId: user.studentId,
      guardianDetails: user.guardianDetails,
    };

    const accessToken = jwt.sign(
      newPayload,
      process.env.JWT_SECRET || "JWT_SECRET",
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      data: { accessToken, user: newPayload }
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    const tokenId = refreshToken.substring(refreshToken.length - 20);
    const decoded = jwt.decode(refreshToken);
    if (decoded && decoded._id) {
      const user = await User.findById(decoded._id);
      if (user) {
        await user.removeActiveSession(tokenId);
      }
    }
  }

  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = { registerUser, loginUser, googleLogin, refreshAccessToken, logoutUser };
