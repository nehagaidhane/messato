const jwt = require("jsonwebtoken");

// ✅ Verify Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, type }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Vendor Check
const isVendor = (req, res, next) => {
  if (!req.user || req.user.type !== "vendor") {
    return res.status(403).json({ message: "Vendor only access" });
  }
  next();
};

// ✅ User Check
const isUser = (req, res, next) => {
  if (!req.user || req.user.type !== "user") {
    return res.status(403).json({ message: "User only access" });
  }
  next();
};
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "user") {
      return res.status(403).json({ message: "Not a user" });
    }

    req.user = decoded; // ✅ VERY IMPORTANT
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = {
  verifyToken,
  isVendor,
  isUser,
  authenticateUser
};