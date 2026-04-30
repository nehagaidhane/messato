const express = require("express");
const router = express.Router();

const { verifyToken, isVendor } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/vendorDashboardController");

// ✅ SECURE ROUTE
router.get("/dashboard", verifyToken, isVendor, getDashboard);

module.exports = router;