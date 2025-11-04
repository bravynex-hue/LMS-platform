const User = require("../../models/User");

// Build OAuth URL
const getGoogleAuthUrl = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ success: false, message: "Google OAuth env vars not set" });
    }
    const { google } = require("googleapis");
    const oauth2Client = new (google.auth.OAuth2)(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];
    const state = Buffer.from(JSON.stringify({ userId: req.user?.id || req.user?._id || "" })).toString("base64");
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      state,
    });
    res.status(200).json({ success: true, data: { url } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to init Google OAuth" });
  }
};

// OAuth callback
const handleGoogleCallback = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ success: false, message: "Google OAuth env vars not set" });
    }
    const { code, state } = req.query;
    if (!state) return res.status(400).json({ success: false, message: "Missing state" });
    let userId = null;
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64").toString());
      userId = parsed.userId;
    } catch {}
    if (!userId) return res.status(400).json({ success: false, message: "Invalid state" });
    const { google } = require("googleapis");
    const oauth2Client = new (google.auth.OAuth2)(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.google = { connected: true, ...tokens };
    await user.save();

    res.status(200).json({ success: true, message: "Google connected" });
  } catch (e) {
    res.status(500).json({ success: false, message: "OAuth callback failed" });
  }
};

// Disconnect
const disconnectGoogle = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.google = { connected: false };
    await user.save();
    res.status(200).json({ success: true, message: "Google disconnected" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to disconnect" });
  }
};

// Status
const getGoogleStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: { connected: !!user.google?.connected } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to get status" });
  }
};

module.exports = {
  getGoogleAuthUrl,
  handleGoogleCallback,
  disconnectGoogle,
  getGoogleStatus,
};


