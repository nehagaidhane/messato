const { db } = require("../config/db");
const express = require("express");
const router  = express.Router();
const { verifyToken, isAdmin, requireRole } = require("../middleware/authMiddleware");
const {
  getVendors,
  getVendorById,
  getVendorCounts,
  updateVendorStatus,
} = require("../controllers/vendorController");

/* Haversine */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dL = ((lat2-lat1)*Math.PI)/180, dN = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dL/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dN/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Public
router.get("/nearby", async (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: "lat and lng required" });
  }

  try {
      const [rows] = await db.query(`
        SELECT
          vp.*,
          v.id    AS vendor_id,
          v.name  AS vendor_name,
          v.email AS vendor_email
        FROM vendor_profiles vp
        LEFT JOIN vendors v ON v.id = vp.vendor_id
        WHERE vp.status = 'approved'
      `);

    let vendors = [];

    for (let v of rows) {
      const lat = Number(v.latitude);
      const lng = Number(v.longitude);

      // ✅ SAFE CHECK (MOST IMPORTANT FIX)
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

      const distance = haversine(userLat, userLng, lat, lng);

      if (isNaN(distance)) continue;

      vendors.push({
        ...v,
        distance,
      });
    }

    let filtered = vendors.filter(v => v.distance <= 1);

    if (!filtered.length) {
      filtered = vendors.filter(v => v.distance <= 2);
    }

    res.json({
      vendors: filtered.sort((a, b) => a.distance - b.distance),
    });

  } catch (err) {
    console.error("🔥 Nearby API Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});
router.get("/public", async (req, res) => {
  const [vendors] = await db.query(`
    SELECT * FROM vendor_profiles WHERE status='approved'
  `);
  res.json(vendors);
});

// IMPORTANT: /counts must come before /:id
router.get("/counts",     verifyToken, isAdmin, getVendorCounts);
router.get("/",           verifyToken, isAdmin, getVendors);
router.get("/:id",        verifyToken, requireRole("admin", "user", "vendor"), getVendorById);
router.put("/:id/status", verifyToken, isAdmin, updateVendorStatus);

module.exports = router;