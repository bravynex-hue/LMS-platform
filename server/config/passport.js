const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const { generateUniqueStudentId } = require("../helpers/studentIdGenerator");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: (process.env.BACKEND_URL || "http://localhost:5000") + "/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 
          $or: [
            { "google.profileId": profile.id }, 
            { userEmail: profile.emails[0].value }
          ] 
        });

        if (user) {
          // Update google info if not already set or changed
          user.google.connected = true;
          user.google.profileId = profile.id;
          user.google.access_token = accessToken;
          user.provider = user.provider || 'google';
          user.providerId = profile.id;
          if (profile.photos && profile.photos.length > 0) {
            user.avatar = user.avatar || profile.photos[0].value;
          }
          await user.save();
          user.isNewUser = false;
          return done(null, user);
        }

        const mode = req.query.state || 'signin';
        if (mode === 'signin') {
          return done(null, false, { message: 'not_registered' });
        }

        // Create new user
        const studentId = await generateUniqueStudentId();
        
        // Generate a valid userName (alphabets and spaces only)
        let baseUserName = profile.displayName.replace(/[^A-Za-z\s]/g, '').trim();
        if (baseUserName.length < 3) baseUserName = "LMS User";
        if (baseUserName.length > 25) baseUserName = baseUserName.substring(0, 25);
        
        // Ensure uniqueness by appending numbers if needed
        let userName = baseUserName;
        let counter = 1;
        while (await User.findOne({ userName })) {
          userName = `${baseUserName} ${counter}`;
          counter++;
        }

        user = new User({
          userName,
          userEmail: profile.emails[0].value,
          role: "user",
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "",
          provider: "google",
          providerId: profile.id,
          google: {
            connected: true,
            profileId: profile.id,
            access_token: accessToken,
          },
          studentId: studentId,
          isEmailVerified: true
        });

        await user.save();
        user.isNewUser = true;
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: (process.env.BACKEND_URL || "http://localhost:5000") + "/auth/github/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        
        let user = await User.findOne({ 
          $or: [
            { "github.profileId": profile.id }, 
            { userEmail: email }
          ] 
        });

        if (user) {
          user.github.connected = true;
          user.github.profileId = profile.id;
          user.github.access_token = accessToken;
          user.provider = user.provider || 'github';
          user.providerId = profile.id;
          if (profile.photos && profile.photos.length > 0) {
            user.avatar = user.avatar || profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        const mode = req.query.state || 'signin';
        if (mode === 'signin') {
          return done(null, false, { message: 'not_registered' });
        }

        // Create new user
        const studentId = await generateUniqueStudentId();
        
        let baseUserName = (profile.displayName || profile.username).replace(/[^A-Za-z\s]/g, '').trim();
        if (baseUserName.length < 3) baseUserName = "LMS Dev";
        if (baseUserName.length > 25) baseUserName = baseUserName.substring(0, 25);
        
        let userName = baseUserName;
        let counter = 1;
        while (await User.findOne({ userName })) {
          userName = `${baseUserName} ${counter}`;
          counter++;
        }

        user = new User({
          userName,
          userEmail: email,
          role: "user",
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "",
          provider: "github",
          providerId: profile.id,
          github: {
            connected: true,
            profileId: profile.id,
            access_token: accessToken,
          },
          studentId: studentId,
          isEmailVerified: true
        });

        await user.save();
        user.isNewUser = true;
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
