const { db } = require("../config/db");
const bcrypt = require("bcrypt");

// ================= CREATE ADMIN =================
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [existing] = await db.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO admins (name, email, password, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role || "admin", status || "active"]
    );

    res.status(201).json({ message: "Admin created successfully" });

  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ADMINS =================
exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(`
      SELECT id, name, email, role, status, created_at 
      FROM admins 
      ORDER BY id DESC
    `);

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

// ================= GET USERS =================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email,
             COALESCE(status, 'active') AS status,
             created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(users);

  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= TOGGLE USER STATUS =================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query(
      "SELECT status FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentStatus = user[0].status || "active";

    const newStatus = currentStatus === "blocked" ? "active" : "blocked";

    await db.query(
      "UPDATE users SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      message: `User ${newStatus}`,
      status: newStatus,
      userId: id,
    });

  } catch (err) {
    console.error("Toggle User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};