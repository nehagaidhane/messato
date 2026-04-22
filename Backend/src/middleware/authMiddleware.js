const jwt = require("jsonwebtoken");

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ TOKEN VERIFIED:", decoded);

    req.user = decoded; // { id, role, type }
    next();

  } catch (err) {
    console.log("❌ TOKEN ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= GENERIC ROLE CHECK =================
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // check both type & role safely
    const userRole = req.user.role || req.user.type;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

// ================= ROLE MIDDLEWARE =================

// ✅ ADMIN
const isAdmin = (req, res, next) => {
  console.log("👤 USER:", req.user);

  if (!req.user) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const role = req.user.role || req.user.type;

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};

// ✅ USER
const isUser = (req, res, next) => {
  if (!req.user || (req.user.type !== "user" && req.user.role !== "user")) {
    return res.status(403).json({ message: "User only access" });
  }
  next();
};

// ✅ VENDOR
const isVendor = (req, res, next) => {
  if (!req.user || (req.user.type !== "vendor" && req.user.role !== "vendor")) {
    return res.status(403).json({ message: "Vendor only access" });
  }
  next();
};

// ✅ SUPPORT
const isSupport = (req, res, next) => {
  if (!req.user || req.user.role !== "support") {
    return res.status(403).json({ message: "Support only" });
  }
  next();
};

// ✅ FINANCE
const isFinance = (req, res, next) => {
  if (!req.user || req.user.role !== "finance") {
    return res.status(403).json({ message: "Finance only" });
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  isVendor,
  isUser,
  isAdmin,
  isSupport,
  isFinance,
};