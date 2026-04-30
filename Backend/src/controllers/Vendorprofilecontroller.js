const { db } = require("../config/db");

// ── GET /api/vendor-profile/profile ───────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [[profile]] = await db.query(
      `SELECT
        v.id, v.email, v.created_at, v.status AS account_status, v.is_active,
        vp.mess_name, vp.owner_name, vp.mobile, vp.experience,
        vp.description, vp.profile_image, vp.address, vp.city,
        vp.state, vp.zip, vp.town, vp.latitude, vp.longitude,
        vp.service_radius, vp.food_type, vp.cuisine_type,
        vp.uses_onion_garlic, vp.operating_days, vp.fssai_number,
        vp.fssai_date, vp.fssai_validity, vp.avg_rating, vp.rating_count,
        vp.tags, vp.status, vp.rejection_reason, vp.updated_at
       FROM vendors v
       LEFT JOIN vendor_profiles vp ON v.id = vp.vendor_id
       WHERE v.id = ?`,
      [vendorId]
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/vendor-profile/profile ───────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      mess_name, owner_name, mobile, experience, description,
      address, city, state, zip, town, fssai_number
    } = req.body;

    const [[existing]] = await db.query(
      "SELECT id FROM vendor_profiles WHERE vendor_id = ?", [vendorId]
    );

    if (existing) {
      await db.query(
        `UPDATE vendor_profiles SET
          mess_name=?, owner_name=?, mobile=?, experience=?, description=?,
          address=?, city=?, state=?, zip=?, town=?, fssai_number=?
         WHERE vendor_id=?`,
        [mess_name, owner_name, mobile, experience, description,
         address, city, state, zip, town, fssai_number, vendorId]
      );
    } else {
      await db.query(
        `INSERT INTO vendor_profiles
          (vendor_id, mess_name, owner_name, mobile, experience, description,
           address, city, state, zip, town, fssai_number)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [vendorId, mess_name, owner_name, mobile, experience, description,
         address, city, state, zip, town, fssai_number]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendor-profile/documents ─────────────────────────────────────────
exports.getDocuments = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const [docs] = await db.query(
      `SELECT id, doc_type, file_url, uploaded_at
       FROM vendor_documents WHERE vendor_id = ? ORDER BY uploaded_at ASC`,
      [vendorId]
    );

    const formatted = docs.map(d => ({
      ...d,
      file_url: d.file_url && !d.file_url.startsWith("http")
        ? `${process.env.API_BASE_URL || "http://localhost:5000"}${d.file_url.startsWith("/") ? "" : "/"}${d.file_url}`
        : d.file_url
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get Documents Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendor-profile/subscribers ───────────────────────────────────────
exports.getSubscribers = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [subscribers] = await db.query(
      `SELECT
        u.id, u.name, u.email, u.phone,
        COUNT(o.id)            AS total_orders,
        SUM(o.total_amount)    AS total_spent,
        MAX(o.created_at)      AS last_order,
        MIN(o.created_at)      AS first_order
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.vendor_id = ?
       GROUP BY u.id, u.name, u.email, u.phone
       ORDER BY last_order DESC`,
      [vendorId]
    );

    res.json({ subscribers, total: subscribers.length });
  } catch (err) {
    console.error("Get Subscribers Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendor-profile/payouts ───────────────────────────────────────────
exports.getPayouts = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // 1. Pending balance
    const [[pending]] = await db.query(
      `SELECT COALESCE(SUM(payout_amount), 0) AS balance
       FROM payouts WHERE vendor_id = ? AND status = 'pending'`,
      [vendorId]
    );

    // 2. Last paid payout
    const [[lastPaid]] = await db.query(
      `SELECT payout_amount, created_at
       FROM payouts WHERE vendor_id = ? AND status = 'paid'
       ORDER BY created_at DESC LIMIT 1`,
      [vendorId]
    );

    // 3. Next payout (processed, not yet paid)
    const [[nextPayout]] = await db.query(
      `SELECT payout_amount, start_date, end_date
       FROM payouts WHERE vendor_id = ? AND status = 'processed'
       ORDER BY created_at ASC LIMIT 1`,
      [vendorId]
    );

    // 4. This week earnings
    const [[thisWeek]] = await db.query(
      `SELECT
        COALESCE(SUM(order_amount), 0)      AS gross_earning,
        COALESCE(SUM(commission_amount), 0) AS total_commission,
        COALESCE(SUM(vendor_share), 0)      AS net_payable
       FROM commission_statements
       WHERE vendor_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [vendorId]
    );

    // 5. This month earnings
    const [[thisMonth]] = await db.query(
      `SELECT
        COALESCE(SUM(order_amount), 0)      AS gross_earning,
        COALESCE(SUM(commission_amount), 0) AS total_commission,
        COALESCE(SUM(vendor_share), 0)      AS net_payable
       FROM commission_statements
       WHERE vendor_id = ?
         AND MONTH(created_at) = MONTH(NOW())
         AND YEAR(created_at)  = YEAR(NOW())`,
      [vendorId]
    );

    // 6. All time
    const [[allTime]] = await db.query(
      `SELECT
        COALESCE(SUM(order_amount), 0)      AS gross_earning,
        COALESCE(SUM(commission_amount), 0) AS total_commission,
        COALESCE(SUM(vendor_share), 0)      AS net_payable
       FROM commission_statements WHERE vendor_id = ?`,
      [vendorId]
    );

    // 7. Payout history — uses correct column payout_amount (NOT amount)
    const [payoutHistory] = await db.query(
      `SELECT
        p.id, p.status, p.payout_amount, p.total_revenue,
        p.total_commission, p.total_vendor_earning,
        p.total_orders, p.start_date, p.end_date, p.created_at
       FROM payouts p
       WHERE p.vendor_id = ?
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [vendorId]
    );

    // 8. Commission rate
    const [[commission]] = await db.query(
      `SELECT type, value FROM commissions WHERE vendor_id = ? LIMIT 1`,
      [vendorId]
    );

    // 9. Commission statements detail
    const [commissionStatements] = await db.query(
      `SELECT
        cs.id, cs.order_id, cs.order_amount,
        cs.commission_amount, cs.vendor_share, cs.created_at,
        u.name AS user_name
       FROM commission_statements cs
       LEFT JOIN orders o ON cs.order_id = o.id
       LEFT JOIN users  u ON o.user_id   = u.id
       WHERE cs.vendor_id = ?
       ORDER BY cs.created_at DESC
       LIMIT 100`,
      [vendorId]
    );

    // 10. Bank details
    const [[bank]] = await db.query(
      `SELECT account_holder_name, bank_name, account_number, ifsc_code, branch_name
       FROM vendor_bank_details WHERE vendor_id = ? LIMIT 1`,
      [vendorId]
    );

    res.json({
      pendingBalance:   Number(pending.balance)                     || 0,
      lastPaidAmount:   lastPaid   ? Number(lastPaid.payout_amount)  : 0,
      lastPaidDate:     lastPaid   ? lastPaid.created_at             : null,
      nextPayoutAmount: nextPayout ? Number(nextPayout.payout_amount): 0,
      thisWeek,
      thisMonth,
      allTime,
      payoutHistory,
      commissionStatements,
      commissionRate: commission || null,
      bankDetails:    bank       || null,
    });
  } catch (err) {
    console.error("Get Payouts Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/vendor-profile/complaints ────────────────────────────────────────
exports.getComplaints = async (req, res) => {
  try {
    const vendorId = req.user.id;

    let complaints = [];
    try {
      const [rows] = await db.query(
        `SELECT c.id, c.issue, c.status, c.created_at, u.name AS user_name
         FROM complaints c
         JOIN users u ON c.user_id = u.id
         WHERE c.vendor_id = ?
         ORDER BY c.created_at DESC`,
        [vendorId]
      );
      complaints = rows;
    } catch {
      complaints = [];
    }

    res.json({ complaints, total: complaints.length });
  } catch (err) {
    console.error("Get Complaints Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/vendor-profile/holiday ──────────────────────────────────────────
// Toggles is_active on the vendors table (1 = active, 0 = on holiday/inactive).
// Run this once in your DB if the column doesn't exist yet:
//   ALTER TABLE vendors ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
exports.markHoliday = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Read current is_active value
    const [[vendor]] = await db.query(
      "SELECT is_active FROM vendors WHERE id = ?",
      [vendorId]
    );

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Toggle: if currently active (1) → set inactive (0) = holiday ON
    //         if currently inactive (0) → set active (1) = holiday OFF
    const newIsActive = vendor.is_active ? 0 : 1;

    await db.query(
      "UPDATE vendors SET is_active = ? WHERE id = ?",
      [newIsActive, vendorId]
    );

    res.json({
      // holiday: true means vendor is ON holiday (inactive)
      holiday: newIsActive === 0,
      is_active: newIsActive,
      message: newIsActive === 0 ? "Holiday marked — you are now inactive" : "Holiday removed — you are now active",
    });
  } catch (err) {
    console.error("Mark Holiday Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};