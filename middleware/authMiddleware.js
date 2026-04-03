const jwt = require("jsonwebtoken");
const User = require("../models/User");

// this middleware checks if the user has a valid token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to request so routes can use it
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: "User account is inactive or not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

// middleware to restrict routes based on role
// usage: authorizeRoles("admin") or authorizeRoles("admin", "analyst")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(" or ")} can do this.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
