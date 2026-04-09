const express = require("express");
const router  = express.Router();
const { db }  = require("../config/db");

/* Haversine */
function haversine(lat1, lon1, lat2, lon2) {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dN = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/vendors/nearby
router.get("/nearby", async (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);
  const tab     = req.query.tab || "popular";
  const maxKm   = parseFloat(req.query.radius) || 5;

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM vendor_profiles WHERE status='approved'`);

    const vendors = rows.map(v => ({
      ...v,
      distanceKm: haversine(userLat, userLng, v.latitude, v.longitude)
    }));

    res.json({ vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ NEW: GET /api/vendors/:vendorId
router.get("/:vendorId", async (req, res) => {
  const { vendorId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM vendor_profiles WHERE id = ? LIMIT 1",
      [vendorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ vendor: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;