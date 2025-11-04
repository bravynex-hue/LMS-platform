const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 13,
    unique: true,
    validate: {
      validator: function(v) {
        // Only alphabets and spaces are allowed
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: 'Name can contain only letters and spaces (3-13 characters)'
    }
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Only enforce uniqueness for non-null values
    trim: true
  },
  dob: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  guardianDetails: {
    type: String,
    trim: true,
    maxlength: 50,
    validate: {
      validator: function(v) {
        return !v || /^[a-zA-Z\s\-'\.]+$/.test(v);
      },
      message: 'Guardian name contains invalid characters'
    }
  },
  
  // Security fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset fields
  passwordResetOTP: String,
  passwordResetExpires: Date,
  passwordResetIP: String,
  passwordResetAttempts: {
    type: Number,
    default: 0
  },
  
  // Login tracking
  lastLoginIP: String,
  lastLoginUserAgent: String,
  lastLoginAt: Date,
  registrationIP: String,
  registrationUserAgent: String,
  
  // Account security
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  twoFactorBackupCodes: [String],
  
  // Session management
  activeSessions: [{
    tokenId: String,
    ipAddress: String,
    userAgent: String,
    createdAt: Date,
    lastActivity: Date
  }],
  
  // Security preferences
  securitySettings: {
    loginNotifications: {
      type: Boolean,
      default: true
    },
    suspiciousActivityAlerts: {
      type: Boolean,
      default: true
    },
    dataExportRequests: {
      type: Boolean,
      default: false
    }
  },
  // Google OAuth
  google: {
    connected: { type: Boolean, default: false },
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetOTP;
      delete ret.emailVerificationToken;
      delete ret.twoFactorSecret;
      delete ret.twoFactorBackupCodes;
      delete ret.activeSessions;
      return ret;
    }
  }
});

// Optimized indexes for performance and security
UserSchema.index({ userEmail: 1 }, { unique: true }); // Unique index for faster lookups
UserSchema.index({ userName: 1 }, { unique: true }); // Unique index for faster lookups
UserSchema.index({ studentId: 1 }, { unique: true, sparse: true }); // Unique index for student IDs
UserSchema.index({ passwordResetExpires: 1 }, { expireAfterSeconds: 0, sparse: true });
UserSchema.index({ emailVerificationExpires: 1 }, { expireAfterSeconds: 0, sparse: true });
UserSchema.index({ accountLockedUntil: 1 }, { sparse: true }); // Sparse index - only for locked accounts
UserSchema.index({ lastLoginAt: -1 }, { sparse: true });
// Compound index for login queries
UserSchema.index({ userEmail: 1, password: 1 });

// Pre-save middleware for security
UserSchema.pre('save', function(next) {
  // Ensure email is normalized
  if (this.userEmail) {
    this.userEmail = this.userEmail.toLowerCase().trim();
  }
  
  // Ensure username is trimmed
  if (this.userName) {
    this.userName = this.userName.trim();
  }
  
  // Ensure guardian details are trimmed
  if (this.guardianDetails) {
    this.guardianDetails = this.guardianDetails.trim();
  }
  
  next();
});

// Instance methods
UserSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
};

UserSchema.methods.incrementFailedAttempts = function() {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

UserSchema.methods.resetFailedAttempts = function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  return this.save();
};

UserSchema.methods.addActiveSession = function(sessionData) {
  // Remove old sessions (keep only last 5)
  if (this.activeSessions.length >= 5) {
    this.activeSessions = this.activeSessions
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 4);
  }
  
  this.activeSessions.push({
    ...sessionData,
    createdAt: new Date(),
    lastActivity: new Date()
  });
  
  return this.save();
};

UserSchema.methods.removeActiveSession = function(tokenId) {
  this.activeSessions = this.activeSessions.filter(session => session.tokenId !== tokenId);
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
