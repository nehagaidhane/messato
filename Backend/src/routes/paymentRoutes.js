// routes/paymentRoutes.js
// ─────────────────────────────────────────────────────────────────
// Razorpay test-mode payment routes with 80/20 vendor/admin split
// ─────────────────────────────────────────────────────────────────

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const {db }= require("../config/db"); // your mysql2/promise pool
const router = express.Router();

// ── Razorpay instance (reads from .env) ─────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Commission config ────────────────────────────────────────────
const COMMISSION_TYPE = "percentage";
const COMMISSION_VALUE = 20; // admin takes 20%
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("FATAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in .env");
}

// ────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Body: { order_id, vendor_id, total_amount }
// Returns: { razorpay_order_id, amount, currency, key_id }
// ────────────────────────────────────────────────────────────────
router.post("/create-order", async (req, res) => {
  try {
    const { order_id, vendor_id, total_amount } = req.body;

    if (!order_id || !vendor_id || !total_amount) {
      return res.status(400).json({ error: "order_id, vendor_id, total_amount are required" });
    }

    const amountInPaise = Math.round(parseFloat(total_amount) * 100); // Razorpay uses paise

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${order_id}`,
      notes: {
        order_id: String(order_id),
        vendor_id: String(vendor_id),
      },
    });

    return res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ error: "Failed to create Razorpay order" ,details: err.message});
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         order_id, vendor_id, total_amount }
// Verifies signature → splits amount → writes to DB
// ────────────────────────────────────────────────────────────────
router.post("/verify", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      vendor_id,
      total_amount,
    } = req.body;

    // ── 1. Verify Razorpay signature ──────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed: invalid signature" });
    }

    // ── 2. Calculate split ────────────────────────────────────
    const total = parseFloat(total_amount);
    const commissionAmount = parseFloat(((COMMISSION_VALUE / 100) * total).toFixed(2));
    const vendorEarning = parseFloat((total - commissionAmount).toFixed(2));

    await conn.beginTransaction();

    // ── 3. Insert into order_payments ────────────────────────
    const [paymentRow] = await conn.execute(
      `INSERT INTO order_payments
        (order_id, vendor_id, total_amount, commission_type, commission_value,
         commission_amount, vendor_earning, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [order_id, vendor_id, total, COMMISSION_TYPE, COMMISSION_VALUE, commissionAmount, vendorEarning]
    );
    const paymentId = paymentRow.insertId;

    // ── 4. Upsert vendor payout record ────────────────────────
    // Check if an open (pending) payout period exists for this vendor
    const [existingPayout] = await conn.execute(
      `SELECT id, total_orders, total_revenue, total_commission, total_vendor_earning, payout_amount
       FROM payouts
       WHERE vendor_id = ? AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [vendor_id]
    );

    let payoutId;
    const today = new Date().toISOString().split("T")[0];

    if (existingPayout.length > 0) {
      // Accumulate into existing pending payout
      const p = existingPayout[0];
      payoutId = p.id;
      await conn.execute(
        `UPDATE payouts SET
           total_orders      = total_orders + 1,
           total_revenue     = total_revenue + ?,
           total_commission  = total_commission + ?,
           total_vendor_earning = total_vendor_earning + ?,
           payout_amount     = payout_amount + ?,
           end_date          = ?
         WHERE id = ?`,
        [total, commissionAmount, vendorEarning, vendorEarning, today, payoutId]
      );
    } else {
      // Create new payout period
      const [payoutRow] = await conn.execute(
        `INSERT INTO payouts
          (vendor_id, total_orders, total_revenue, total_commission,
           total_vendor_earning, payout_amount, status, start_date, end_date)
         VALUES (?, 1, ?, ?, ?, ?, 'pending', ?, ?)`,
        [vendor_id, total, commissionAmount, vendorEarning, vendorEarning, today, today]
      );
      payoutId = payoutRow.insertId;
    }

    // ── 5. Insert payout_transaction ─────────────────────────
    await conn.execute(
      `INSERT INTO payout_transactions (payout_id, order_id, amount)
       VALUES (?, ?, ?)`,
      [payoutId, order_id, vendorEarning]
    );
    const [result] =await conn.execute(
  `UPDATE orders 
   SET payment_status = 'done',
       status = 'accepted',
       payment_id = ?
   WHERE id = ?`,
  [razorpay_payment_id, order_id]
);
console.log("UPDATE RESULT:", result);
    await conn.commit();

    return res.json({
      success: true,
      message: "Payment verified and recorded",
      breakdown: {
        total_amount: total,
        admin_commission: commissionAmount,
        vendor_earning: vendorEarning,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error("verify error:", err);
    return res.status(500).json({ error: "Payment recorded but DB write failed" });
  } finally {
    conn.release();
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/payment/cod
// Body: { order_id, vendor_id, total_amount }
// COD: full amount goes to vendor; vendor owes admin later
// payment_status = 'pending' (admin collects via vendor dashboard)
// ────────────────────────────────────────────────────────────────
router.post("/cod", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { order_id, vendor_id, total_amount } = req.body;

    if (!order_id || !vendor_id || !total_amount) {
      return res.status(400).json({ error: "order_id, vendor_id, total_amount are required" });
    }

    const total = parseFloat(total_amount);
    // For COD: vendor gets everything initially, owes admin 20% later
    const commissionAmount = parseFloat(((COMMISSION_VALUE / 100) * total).toFixed(2));
    const vendorEarning = parseFloat((total - commissionAmount).toFixed(2));

    await conn.beginTransaction();

    // Insert order_payments with pending status (cash not yet split)
    const [paymentRow] = await conn.execute(
      `INSERT INTO order_payments
        (order_id, vendor_id, total_amount, commission_type, commission_value,
         commission_amount, vendor_earning, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [order_id, vendor_id, total, COMMISSION_TYPE, COMMISSION_VALUE, commissionAmount, vendorEarning]
    );
    const paymentId = paymentRow.insertId;

    // Upsert payout (same logic as online but status stays pending for manual settlement)
    const [existingPayout] = await conn.execute(
      `SELECT id FROM payouts
       WHERE vendor_id = ? AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [vendor_id]
    );

    const today = new Date().toISOString().split("T")[0];
    let payoutId;

    if (existingPayout.length > 0) {
      payoutId = existingPayout[0].id;
      await conn.execute(
        `UPDATE payouts SET
           total_orders          = total_orders + 1,
           total_revenue         = total_revenue + ?,
           total_commission      = total_commission + ?,
           total_vendor_earning  = total_vendor_earning + ?,
           payout_amount         = payout_amount + ?,
           end_date              = ?
         WHERE id = ?`,
        [total, commissionAmount, vendorEarning, vendorEarning, today, payoutId]
      );
    } else {
      const [payoutRow] = await conn.execute(
        `INSERT INTO payouts
          (vendor_id, total_orders, total_revenue, total_commission,
           total_vendor_earning, payout_amount, status, start_date, end_date)
         VALUES (?, 1, ?, ?, ?, ?, 'pending', ?, ?)`,
        [vendor_id, total, commissionAmount, vendorEarning, vendorEarning, today, today]
      );
      payoutId = payoutRow.insertId;
    }

    await conn.execute(
      `INSERT INTO payout_transactions (payout_id, order_id, amount)
       VALUES (?, ?, ?)`,
      [payoutId, order_id, vendorEarning]
    );

    await conn.commit();

    return res.json({
      success: true,
      message: "COD order recorded. Vendor must settle 20% commission manually.",
      breakdown: {
        total_amount: total,
        admin_commission_due: commissionAmount, // vendor owes this to admin
        vendor_earning: vendorEarning,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error("cod error:", err);
    return res.status(500).json({ error: "Failed to record COD order" });
  } finally {
    conn.release();
  }
});

module.exports = router;