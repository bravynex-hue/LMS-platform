const jwt = require("jsonwebtoken");

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeader");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET || "JWT_SECRET");

    req.user = payload;

    next();
  } catch (e) {
    const isExpired = e?.name === "TokenExpiredError";
    const isInvalid = e?.name === "JsonWebTokenError" || e?.name === "NotBeforeError";
    const message = isExpired ? "Token expired" : isInvalid ? "Invalid token" : "Authentication failed";
    return res.status(401).json({ success: false, message });
  }
};

module.exports = authenticate;
