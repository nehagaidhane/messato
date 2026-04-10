const { db } = require("../config/db");

// ================= GET USERS =================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(users);

  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};