const { db } = require("../config/db");

// ✅ GET ALL ORDERS (for vendor)
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [orders] = await db.query(`
      SELECT 
        o.id,
        o.status,
        o.payment_status,
        o.total_amount,
        o.created_at,
        u.name AS customer,
        u.mobile AS phone,

        oi.quantity,
        m.name AS item,
        m.price

      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id

      WHERE o.vendor_id = ?
      ORDER BY o.created_at DESC
    `, [vendorId]);

    // 🔥 FORMAT DATA (IMPORTANT)
    const formatted = orders.map(o => ({
      id: o.id,
      customer: o.customer,
      phone: o.phone,
      item: o.item || "Meal",
      qty: o.quantity || 1,
      price: o.price || o.total_amount,
      status: o.status,
      payment: o.payment_status,
      time: new Date(o.created_at).toLocaleTimeString(),
      type: "daily" // optional
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed statuses
    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "rejected"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ensure order belongs to vendor
    const [order] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND vendor_id = ?",
      [orderId, vendorId]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    res.json({ message: "Order updated successfully" });

  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};