// routes/vendor/support.js

const express = require("express");
const router = express.Router();
const { db } = require("../config/db");

// ✅ FIX: import correctly
const { verifyToken } = require("../middleware/authMiddleware");

// Protect all routes
router.use(verifyToken);

// ─────────────────────────────────────────────
// ✅ GET /api/vendor/support/tickets
// ─────────────────────────────────────────────
router.get("/tickets", async (req, res) => {
  try {
    const vendorId = req.vendorId || req.user?.id;

    // ✅ safety check
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(
      `SELECT id, subject, category, status, admin_reply, created_at
       FROM support_tickets
       WHERE vendor_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [vendorId]
    );

    res.json(rows);

  } catch (err) {
    console.error("FETCH TICKETS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});


// ─────────────────────────────────────────────
// ✅ POST /api/vendor/support/tickets
// ─────────────────────────────────────────────
router.post("/tickets", async (req, res) => {
  try {
    const vendorId = req.vendorId;

    // ✅ safety check
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let { subject, category, message } = req.body;

    // ✅ validation
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    subject = subject.trim();
    message = message.trim();

    const validCategories = ["general", "billing", "technical", "orders", "account"];

    // ✅ fallback if category missing
    if (!category) category = "general";

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const [result] = await db.query(
      `INSERT INTO support_tickets 
        (vendor_id, subject, category, message, status, priority)
       VALUES (?, ?, ?, ?, 'open', 'normal')`,
      [vendorId, subject, category, message]
    );

    res.status(201).json({
      message: "Ticket created",
      id: result.insertId,
    });

  } catch (err) {
    console.error("CREATE TICKET ERROR:", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

module.exports = router;