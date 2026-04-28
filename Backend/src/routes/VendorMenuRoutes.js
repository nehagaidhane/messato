const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload"); // ✅ FIXED

const { verifyToken, isVendor } = require("../middleware/authMiddleware");

const {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenu   // ✅ make sure imported
} = require("../controllers/vendorMenuController");

// ✅ ROUTES
router.get("/menus", verifyToken, isVendor, getMenus);

router.post(
  "/menus",
  verifyToken,
  isVendor,
  upload.single("image"),   // ✅ Cloudinary upload
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

module.exports = router;