const express = require("express");
const router = express.Router();

const {
  createAdmin,
  getAdmins,
  deleteAdmin,
} = require("../controllers/adminController");

const {
  verifyToken,
  isAdmin,
  isFinance,
} = require("../middleware/authMiddleware");

// ================= ADMIN ROUTES =================

// 🔐 Only admin/superadmin can view
router.get("/", verifyToken, isAdmin, getAdmins);

// 🔐 Only superadmin can create admin
router.post("/", verifyToken, isAdmin, createAdmin);

// 🔐 Only admin/superadmin can delete
router.delete("/:id", verifyToken, isAdmin, deleteAdmin);

// // ================= FINANCE =================
// router.get("/finance", verifyToken, isFinance, getFinanceData);

module.exports = router;