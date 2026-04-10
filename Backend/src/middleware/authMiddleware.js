const jwt = require("jsonwebtoken");

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ADD THIS — see exactly what secret is being used
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("TOKEN RECEIVED:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded);

    req.user = decoded; // 🔥 attach user
    next();
  } catch (err) {
    console.error("JWT ERR:", err.message); // "invalid signature" or "jwt expired"
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ================= ROLE MIDDLEWARE =================

const isVendor = (req, res, next) => {
  if (!req.user || req.user.type !== "vendor")
    return res.status(403).json({ message: "Vendor only access" });
  next();
};

const isUser = (req, res, next) => {
  if (!req.user || req.user.type !== "user")
    return res.status(403).json({ message: "User only access" });
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

// Remove duplicate authenticateUser — just alias verifyToken
const authenticateUser = verifyToken;

module.exports = { verifyToken, isVendor, isUser, authenticateUser };