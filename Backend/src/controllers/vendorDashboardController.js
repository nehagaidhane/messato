const { db } = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id; // ✅ FROM YOUR EXISTING MIDDLEWARE

    // 🔹 Total Orders
    const [orders] = await db.query(
      "SELECT COUNT(*) AS totalOrders FROM orders WHERE vendor_id = ?",
      [vendorId]
    );

    // 🔹 Total Revenue (only completed)
    const [revenue] = await db.query(
      "SELECT SUM(total_amount) AS totalRevenue FROM orders WHERE vendor_id = ? AND payment_status = 'done'",
      [vendorId]
    );

    // 🔹 Subscribers (unique users)
    const [subs] = await db.query(
      "SELECT COUNT(DISTINCT user_id) AS subscribers FROM orders WHERE vendor_id = ?",
      [vendorId]
    );

    // 🔹 Rating (from vendor_profiles table)
    const [rating] = await db.query(
      "SELECT avg_rating, rating_count FROM vendor_profiles WHERE vendor_id = ?",
      [vendorId]
    );

    // 🔹 Recent Orders
    const [recentOrders] = await db.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE vendor_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [vendorId]
    );

    res.json({
      totalOrders: orders[0].totalOrders || 0,
      totalRevenue: revenue[0].totalRevenue || 0,
      subscribers: subs[0].subscribers || 0,
      avgRating: rating[0]?.avg_rating || 0,
      ratingCount: rating[0]?.rating_count || 0,
      recentOrders,
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};