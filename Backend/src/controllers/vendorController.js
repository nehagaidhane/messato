const { db } = require("../config/db");

// ── GET /api/vendors  (admin list) ────────────────────────────────────────────
exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.query(`
      SELECT
        v.id,
        v.name,
        v.name AS vendor_name,
        v.email,
        v.created_at,
        COALESCE(vp.status, 'pending')   AS status,
        COALESCE(vp.mess_name, '')       AS mess_name,
        COALESCE(vp.city, '')            AS city,
        COALESCE(vp.mobile, '')          AS mobile,
        COALESCE(vp.owner_name, v.name)  AS owner_name
      FROM vendors v
      LEFT JOIN vendor_profiles vp ON v.id = vp.vendor_id
      ORDER BY v.id DESC
    `);
    
    console.log("Vendors fetched:", vendors.length);
    if (vendors.length > 0) {
      console.log("Sample vendor:", {
        id: vendors[0].id,
        name: vendors[0].name,
        owner_name: vendors[0].owner_name,
        mess_name: vendors[0].mess_name,
        email: vendors[0].email
      });
    }
    
    res.json(vendors);
  } catch (err) {
    console.error("Fetch Vendors Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendors/counts ───────────────────────────────────────────────────
exports.getVendorCounts = async (req, res) => {
  try {
    const [counts] = await db.query(`
      SELECT
        COALESCE(vp.status, 'pending') AS status,
        COUNT(*) AS count
      FROM vendors v
      LEFT JOIN vendor_profiles vp ON v.id = vp.vendor_id
      GROUP BY COALESCE(vp.status, 'pending')
    `);

    const result = { approved: 0, pending: 0, rejected: 0 };
    counts.forEach(row => {
      if (result.hasOwnProperty(row.status)) {
        result[row.status] = row.count;
      }
    });

    console.log("Counts result:", result);
    res.json(result);
  } catch (err) {
    console.error("Vendor Counts Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendors/:id  (full profile for detail drawer) ────────────────────
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[vendor]] = await db.query(`
      SELECT
        v.id,
        v.name,
        v.name AS vendor_name,
        v.email,
        v.created_at,
        vp.id               AS profile_id,
        COALESCE(vp.owner_name, v.name) AS owner_name,
        vp.mobile,
        vp.mess_name,
        vp.experience,
        vp.description,
        vp.profile_image,
        vp.address,
        vp.city,
        vp.state,
        vp.zip,
        vp.town,
        vp.latitude,
        vp.longitude,
        vp.service_radius,
        vp.food_type,
        vp.cuisine_type,
        vp.uses_onion_garlic,
        vp.operating_days,
        vp.fssai_number,
        vp.fssai_date,
        vp.fssai_validity,
        vp.avg_rating,
        vp.rating_count,
        vp.tags,
        vp.rejection_reason,
        COALESCE(vp.status, 'pending') AS status
      FROM vendors v
      LEFT JOIN vendor_profiles vp ON v.id = vp.vendor_id
      WHERE v.id = ?
      LIMIT 1
    `, [id]);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // ── Documents ─────────────────────────────────────────────────────────────
    let documents = [];
    try {
      const [docs] = await db.query(`
        SELECT doc_type, file_url, uploaded_at
        FROM vendor_documents
        WHERE vendor_id = ?
        ORDER BY uploaded_at ASC
      `, [id]);
      documents = docs;
    } catch (err) {
      console.warn("Documents fetch error:", err.message);
    }

    const docs = {};
    documents.forEach(d => {
      let url = d.file_url;
      if (url && !url.startsWith('http')) {
        url = `${process.env.API_BASE_URL || "http://localhost:5000"}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      docs[d.doc_type] = url;
    });

    // ── Bank details ──────────────────────────────────────────────────────────
    let bankDetails = null;
    try {
      const [[bd]] = await db.query(`
        SELECT
          id,
          account_holder_name,
          bank_name,
          account_number,
          ifsc_code,
          branch_name,
          created_at
        FROM vendor_bank_details
        WHERE vendor_id = ?
        LIMIT 1
      `, [id]);
      bankDetails = bd;
    } catch (err) {
      console.warn("Bank details fetch error:", err.message);
    }

    // ── Commission plan ───────────────────────────────────────────────────────
    let commissionPlan = null;
    try {
      const [[cp]] = await db.query(`
        SELECT id, plan_type, rate, created_at
        FROM vendor_commission_plans
        WHERE vendor_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [id]);
      commissionPlan = cp;
    } catch (err) {
      console.warn("Commission plan fetch error:", err.message);
    }

    console.log("✓ Vendor details fetched:", {
      id: vendor.id,
      name: vendor.owner_name || vendor.name,
      email: vendor.email,
      status: vendor.status
    });

    res.json({
      vendor: {
        ...vendor,
        documents:      docs,
        bankDetails:    bankDetails    ?? null,
        commissionPlan: commissionPlan ?? null,
      }
    });

  } catch (err) {
    console.error("Get Vendor By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/vendors/:id/status ───────────────────────────────────────────────
exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const reason = status === "rejected" ? (rejection_reason ?? null) : null;

    console.log(`Updating vendor ${id} to status: ${status}${reason ? `, reason: ${reason}` : ""}`);

    // Check if profile exists
    const [[profile]] = await db.query(
      `SELECT id FROM vendor_profiles WHERE vendor_id = ?`, [id]
    );

    if (!profile) {
      // Create vendor profile if it doesn't exist
      console.log(`Creating new vendor profile for vendor ${id}`);
      await db.query(
        `INSERT INTO vendor_profiles (vendor_id, status, rejection_reason, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [id, status, reason]
      );
    } else {
      // Update existing profile
      const [result] = await db.query(
        `UPDATE vendor_profiles
         SET status = ?, rejection_reason = ?, updated_at = NOW()
         WHERE vendor_id = ?`,
        [status, reason, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Failed to update vendor status" });
      }
    }

    // Fetch updated vendor
    const [[updatedVendor]] = await db.query(
      `SELECT 
        v.id, 
        v.name, 
        v.email, 
        COALESCE(vp.owner_name, v.name) AS owner_name, 
        vp.mess_name, 
        vp.status
       FROM vendors v
       LEFT JOIN vendor_profiles vp ON v.id = vp.vendor_id
       WHERE v.id = ?`,
      [id]
    );

    console.log(`✓ Vendor ${id} updated to ${status}`);

    res.json({ 
      message: `Vendor ${status} successfully`,
      vendor: updatedVendor,
      status
    });

  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};