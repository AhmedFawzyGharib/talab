const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 🔥 تحقق من الحظر
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    // 🔥 تحقق من الحالة
    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Account inactive",
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};