const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get Authorization header
  const authHeader = req.headers.authorization;

  // Check if header exists
  if (!authHeader) {
    return res.status(401).json({
      message: "Access Denied. No Token Provided."
    });
  }

  // Extract token (Bearer <token>)
  const token = authHeader.split(" ")[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      message: "Invalid Token Format."
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user information for later use
    req.user = decoded;

    // Continue to next middleware/route
    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(403).json({
        message: error.message
    });
  }
};

module.exports = verifyToken;
