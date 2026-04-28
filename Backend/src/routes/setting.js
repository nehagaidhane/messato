// routes/vendor/settings.js

const express = require("express");
const router = express.Router();
const { db } = require("../config/db");

// ⚠️ FIX: import middleware correctly
const { verifyToken } = require("../middleware/authMiddleware");

// Protect all routes
router.use(verifyToken);

// ─────────────────────────────────────────────
// ✅ GET /api/vendor/settings
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const vendorId = req.vendorId || req.user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized - vendor not found" });
    }

    // Get notifications
    const [notifRows] = await db.query(
      `SELECT orders_enabled, subscriptions_enabled, payments_enabled, marketing_enabled
       FROM vendor_notifications 
       WHERE vendor_id = ? 
       LIMIT 1`,
      [vendorId]
    );

    // Get theme
    const [profileRows] = await db.query(
      `SELECT theme_preference 
       FROM vendor_profiles 
       WHERE vendor_id = ? 
       LIMIT 1`,
      [vendorId]
    );

    const notifs = notifRows[0] || {
      orders_enabled: 1,
      subscriptions_enabled: 1,
      payments_enabled: 1,
      marketing_enabled: 0,
    };

    const profile = profileRows[0] || {
      theme_preference: "dark",
    };

    res.json({
      orders_enabled: !!notifs.orders_enabled,
      subscriptions_enabled: !!notifs.subscriptions_enabled,
      payments_enabled: !!notifs.payments_enabled,
      marketing_enabled: !!notifs.marketing_enabled,
      theme_preference: profile.theme_preference,
    });

  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load settings" });
  }
});


// ─────────────────────────────────────────────
// ✅ PUT /api/vendor/settings/notifications
// ─────────────────────────────────────────────
router.put("/notifications", async (req, res) => {
  try {
    const vendorId = req.vendorId || req.user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      orders_enabled,
      subscriptions_enabled,
      payments_enabled,
      marketing_enabled,
    } = req.body;

    await db.query(
      `INSERT INTO vendor_notifications 
        (vendor_id, orders_enabled, subscriptions_enabled, payments_enabled, marketing_enabled)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        orders_enabled        = VALUES(orders_enabled),
        subscriptions_enabled = VALUES(subscriptions_enabled),
        payments_enabled      = VALUES(payments_enabled),
        marketing_enabled     = VALUES(marketing_enabled)`,
      [
        vendorId,
        orders_enabled,
        subscriptions_enabled,
        payments_enabled,
        marketing_enabled,
      ]
    );

    res.json({ message: "Notifications updated" });

  } catch (err) {
    console.error("UPDATE NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});


// ─────────────────────────────────────────────
// ✅ PUT /api/vendor/settings/theme
// ─────────────────────────────────────────────
router.put("/theme", async (req, res) => {
  try {
    const vendorId = req.vendorId || req.user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { theme_preference } = req.body;

    const allowed = ["dark", "light", "system"];
    if (!allowed.includes(theme_preference)) {
      return res.status(400).json({ message: "Invalid theme value" });
    }

    await db.query(
      `UPDATE vendor_profiles 
       SET theme_preference = ? 
       WHERE vendor_id = ?`,
      [theme_preference, vendorId]
    );

    res.json({ message: "Theme updated" });

  } catch (err) {
    console.error("UPDATE THEME ERROR:", err);
    res.status(500).json({ message: "Failed to update theme" });
  }
});

module.exports = router;