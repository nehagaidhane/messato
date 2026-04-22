const express = require("express");
const router = express.Router();

const {
  createAdmin,
  getAdmins,
  deleteAdmin,
  getUsers,
  toggleUserStatus,
} = require("../controllers/adminController");


const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ================= ADMIN =================

// Get all admins
router.get("/admins", verifyToken, isAdmin, getAdmins);

// Create admin
router.post("/admins", verifyToken, isAdmin, createAdmin);

// Delete admin
router.delete("/admins/:id", verifyToken, isAdmin, deleteAdmin);

// ================= USERS =================

// Get all users (for admin panel)
router.get("/users", verifyToken, isAdmin, getUsers);

// Block / Unblock user
router.put("/users/:id/status", verifyToken, isAdmin, toggleUserStatus);

module.exports = router;