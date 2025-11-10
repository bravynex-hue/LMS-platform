const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.find({})
      .select("-password -passwordResetOTP -passwordResetExpires -emailVerificationToken -emailVerificationExpires")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Create user - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { userName, userEmail, password, role } = req.body;

    // Validate required fields
    if (!userName || !userEmail || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userName, userEmail, password, and role are required",
      });
    }

    // Normalize and validate email
    const normalizedEmail = validator.normalizeEmail(userEmail);
    if (!validator.isEmail(normalizedEmail || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Normalize username
    const normalizedUserName = (userName + "").trim().replace(/\s+/g, " ");

    // Validate username length (matching User model: 3-13 characters)
    if (!validator.isLength(normalizedUserName, { min: 3, max: 13 })) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 13 characters",
      });
    }
    
    // Validate username format (only letters and spaces)
    if (!/^[A-Za-z\s]+$/.test(normalizedUserName)) {
      return res.status(400).json({
        success: false,
        message: "Username can contain only letters and spaces",
      });
    }

    // Validate role
    const validRoles = ["user", "instructor", "admin", "hr"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: user, instructor, admin, hr",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ userEmail: normalizedEmail }, { userName: normalizedUserName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      userName: normalizedUserName,
      userEmail: normalizedEmail,
      password: hashPassword,
      role: role,
      isEmailVerified: true, // Admin-created users are auto-verified
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Update user - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { userName, userEmail, password, role } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (userName) {
      const normalizedUserName = (userName + "").trim().replace(/\s+/g, " ");
      if (!validator.isLength(normalizedUserName, { min: 3, max: 13 })) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 13 characters",
        });
      }
      if (!/^[A-Za-z\s]+$/.test(normalizedUserName)) {
        return res.status(400).json({
          success: false,
          message: "Username can contain only letters and spaces",
        });
      }
      user.userName = normalizedUserName;
    }

    if (userEmail) {
      const normalizedEmail = validator.normalizeEmail(userEmail);
      if (!validator.isEmail(normalizedEmail || "")) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address",
        });
      }
      user.userEmail = normalizedEmail;
    }

    if (password) {
      // Validate password strength
      if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      })) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      const validRoles = ["user", "instructor", "admin", "hr"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be one of: user, instructor, admin, hr",
        });
      }
      user.role = role;
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Block/Unblock user (admin only)
const toggleUserBlock = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Toggle user block - Access denied. User role:", req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error toggling user block:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling user block",
      error: error.message,
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      console.error("Delete user - Access denied. User role:", req.user?.role, "User ID:", req.user?._id);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Prevent admin from deleting themselves
    const currentUserId = req.user._id?.toString() || req.user._id;
    const targetUserId = id.toString();
    
    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`User ${user.userName} (${user._id}) deleted by admin ${req.user.userName} (${req.user._id})`);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
      userRole: req.user?.role,
      targetId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserBlock,
  deleteUser,
};

