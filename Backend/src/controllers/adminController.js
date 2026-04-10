const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// ================= CREATE ADMIN =================
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing
    const [existing] = await db.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO admins 
      (name, email, password, role, status) 
      VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, status || "active"]
    );

    return res.status(201).json({
      message: "Admin created successfully",
    });

  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ADMINS =================
exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT id, name, email, role, status, created_at 
       FROM admins 
       ORDER BY id DESC`
    );

    res.json(admins);

  } catch (err) {
    console.error("Fetch Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE ADMIN =================
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM admins WHERE id = ?", [id]);

    res.json({ message: "Admin deleted" });

  } catch (err) {
    console.error("Delete Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

