const express = require("express");
const router = express.Router();

const {
  signupUser,
  signupVendor,
  login,
  refreshToken
} = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const { verifyToken, isVendor, isUser } = require("../middleware/authMiddleware");
console.log("verifyToken:", verifyToken);
console.log("isVendor:", isVendor);
console.log("isUser:", isUser);
// ================= AUTH ROUTES =================

// User signup
router.post("/signup-user", signupUser);

// Vendor signup
router.post("/signup-vendor", signupVendor);

// Login (common for both)
router.post("/login", login);

// Refresh access token
router.get("/refresh", refreshToken);


// ================= TEST PROTECTED ROUTES =================
// (optional for testing middleware)



// Only logged-in users
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

// Only vendor
router.get("/vendor-only", verifyToken, isVendor, (req, res) => {
  res.json({ message: "Welcome Vendor" });
});

// Only user
router.get("/user-only", verifyToken, isUser, (req, res) => {
  res.json({ message: "Welcome User" });
});

module.exports = router;