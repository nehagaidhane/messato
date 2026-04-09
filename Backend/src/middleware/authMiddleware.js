const jwt = require("jsonwebtoken");

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // ❌ No header
  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  // ❌ Wrong format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // 🔥 attach user
    next();

  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ================= ROLE MIDDLEWARE =================

const isVendor = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({ message: "Vendor only" });
  }
  next();
};

const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "User only" });
  }
  next();
};

// ✅ NEW (IMPORTANT)

const isAdmin = (req, res, next) => {
  if (!["admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};


const isSupport = (req, res, next) => {
  if (req.user.role !== "support") {
    return res.status(403).json({ message: "Support only" });
  }
  next();
};

const isFinance = (req, res, next) => {
  if (req.user.role !== "finance") {
    return res.status(403).json({ message: "Finance only" });
  }
  next();
};

module.exports = {
  verifyToken,
  isVendor,
  isUser,
  isAdmin,
  isSupport,
  isFinance,
};