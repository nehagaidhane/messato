const express = require("express");
const router = express.Router();

const { verifyToken, isVendor } = require("../middleware/authMiddleware");
const {
  getVendorOrders,
  updateOrderStatus
} = require("../controllers/vendorOrderController");

// ✅ GET orders
router.get("/orders", verifyToken, isVendor, getVendorOrders);

// ✅ UPDATE status
router.put("/orders/:orderId", verifyToken, isVendor, updateOrderStatus);

module.exports = router;