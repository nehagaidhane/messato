const { db } = require("../config/db");

// ================= GET VENDORS =================
exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.query(`
      SELECT id, owner_name, email, status, created_at
      FROM vendors
      ORDER BY id DESC
    `);

    res.json(vendors);

  } catch (err) {
    console.error("Fetch Vendors Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};