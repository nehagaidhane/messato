const express = require("express");
const router  = express.Router();

const upload = require("../middleware/upload");
const { verifyToken, isVendor } = require("../middleware/authMiddleware");

const {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenu,
  getMenusByDate,
  getSubscriptionPlans,
  calculateCancelRefund,
  getUserDailyMenus
} = require("../controllers/vendorMenuController");


// ── Vendor-protected routes ──────────────────────────────────
router.get("/menus", verifyToken, isVendor, getMenus);

router.post(
  "/menus",
  verifyToken,
  isVendor,
  upload.single("image"),
  createMenu
);

router.put(
  "/menus/:id",
  verifyToken,
  isVendor,
  upload.single("image"),
  updateMenu
);

router.delete("/menus/:id", verifyToken, isVendor, deleteMenu);

router.patch("/menus/:id/toggle", verifyToken, isVendor, toggleMenu);

router.post("/menus/:id/cancel", verifyToken, calculateCancelRefund);


// ── Public / Customer-facing routes ─────────────────────────

// ✅ Daily menus (your main API)
router.get("/daily", getUserDailyMenus);
// 👉 URL: /api/menu/daily?vendorId=3&date=2026-04-28&days=3

// ✅ Menus by exact date
router.get("/menus-by-date", getMenusByDate);
// 👉 URL: /api/menu/menus-by-date?date=2026-04-28

// ✅ Subscription plans
router.get("/subscription-plans", getSubscriptionPlans);
// 👉 URL: /api/menu/subscription-plans?type=weekly&vendor_id=3


module.exports = router;