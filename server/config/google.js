const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "[Google Auth] GOOGLE_CLIENT_ID is not set. Google OAuth will not work correctly."
  );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = { googleClient, GOOGLE_CLIENT_ID };

