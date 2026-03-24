const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

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

module.exports = {
  verifyToken,
  isVendor,
  isUser
};