const router = require("express").Router();
const { db } = require("../config/db");

// POST /api/orders — place a new order
router.post("/", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      vendorId,
      menuId,
      quantity,
      totalPrice,
      specialInstructions,
      deliveryAddress,
    } = req.body;

    const userId = req.user?.id;

    console.log("Order POST:", { userId, vendorId, menuId, quantity, totalPrice, deliveryAddress });

    if (!userId || !vendorId || !menuId) {
      return res.status(400).json({
        error: "Missing required fields",
        debug: { userId, vendorId, menuId },
      });
    }

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders 
        (user_id, vendor_id, total_amount, status, payment_status, delivery_address)
       VALUES (?, ?, ?, 'pending', 'pending', ?)`,
      [userId, vendorId, totalPrice, deliveryAddress || null]
    );

    const orderId = orderResult.insertId;

    await conn.query(
      `INSERT INTO order_items (order_id, menu_id, quantity, special_instructions)
       VALUES (?, ?, ?, ?)`,
      [orderId, menuId, quantity, specialInstructions || null]
    );

    await conn.commit();
    res.json({ success: true, orderId });
  } catch (err) {
    await conn.rollback();
    console.error("Order insert error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// GET /api/orders — user's order history
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;

    // ── DEBUG: log what auth middleware gave us ──
    console.log("GET /api/orders → req.user:", req.user);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        hint: "req.user is null — check auth middleware is applied to this route in app.js/server.js",
      });
    }

    const [orders] = await db.query(
      `SELECT 
          o.id                  AS order_id,
          o.status,
          o.payment_status,
          o.delivery_address,
          o.total_amount,
          o.created_at,
          oi.menu_id,
          oi.quantity,
          oi.special_instructions,
          m.name                AS menu_name,
          m.meal_type,
          m.image               AS menu_image,
          m.price               AS menu_price,
          m.description         AS menu_description,
          v.mess_name           AS vendor_name,
          v.address             AS vendor_address,
          v.city                AS vendor_city
       FROM orders o
       JOIN order_items     oi ON oi.order_id  = o.id
       JOIN menus           m  ON m.id         = oi.menu_id
       JOIN vendor_profiles v  ON v.vendor_id  = o.vendor_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ orders });
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/orders/:id/cancel — cancel a pending order
router.patch("/:id/cancel", async (req, res) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only allow cancelling own orders that are still pending
    const [result] = await db.query(
      `UPDATE orders 
       SET status = 'rejected'
       WHERE id = ? AND user_id = ? AND status = 'pending'`,
      [orderId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: "Order cannot be cancelled (not found, not yours, or already accepted)",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/orders/update-status — payment callback
router.post("/update-status", async (req, res) => {
  try {
    const { order_id, payment_id, status } = req.body;

    await db.execute(
      `UPDATE orders 
       SET payment_status = ?, payment_id = ?, status = 'confirmed'
       WHERE id = ?`,
      [status, payment_id, order_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;