const express = require("express");
const router = express.Router();

const {
  signupUser,
  signupVendor,
  userLogin,
  vendorLogin,
  refreshToken,
  googleLogin,
  facebookLogin,
  appleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { verifyToken, isVendor, isUser } = require("../middleware/authMiddleware");

// ── Signup ──────────────────────────────────────────────────
router.post("/signup-user",   signupUser);
router.post("/signup-vendor", signupVendor);

// ── Email / Password Login ───────────────────────────────────
router.post("/user/login",   userLogin);    // supports rememberMe in body
router.post("/vendor/login", vendorLogin);

// ── Social Login ─────────────────────────────────────────────
router.post("/google-login",   googleLogin);
router.post("/facebook-login", facebookLogin);
router.post("/apple-login",    appleLogin);

// ── Password Reset ───────────────────────────────────────────
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// ── Token Refresh ────────────────────────────────────────────
router.get("/refresh", refreshToken);

// ── Protected test routes ────────────────────────────────────
router.get("/protected",   verifyToken,           (req, res) => res.json({ message: "Protected route accessed", user: req.user }));
router.get("/vendor-only", verifyToken, isVendor, (req, res) => res.json({ message: "Welcome Vendor" }));
router.get("/user-only",   verifyToken, isUser,   (req, res) => res.json({ message: "Welcome User" }));

module.exports = router;