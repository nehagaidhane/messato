const { db } = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Multer Storage ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/vendor-docs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only jpg, png, pdf files allowed"));
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── GET onboarding status ─────────────────────────────────────
exports.getOnboardingStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [profiles] = await db.query(
      "SELECT * FROM vendor_profiles WHERE vendor_id = ?",
      [vendorId]
    );

    if (profiles.length === 0) {
      return res.json({ status: "not_started", profile: null });
    }

    const profile = profiles[0];

    const [docs] = await db.query(
      "SELECT * FROM vendor_documents WHERE vendor_id = ?",
      [vendorId]
    );

    const [bank] = await db.query(
      "SELECT * FROM vendor_bank_details WHERE vendor_id = ?",
      [vendorId]
    );

    // Get commission plan
    const [commission] = await db.query(
      "SELECT * FROM vendor_commission_plans WHERE vendor_id = ?",
      [vendorId]
    );

    return res.json({
      status: profile.status, // pending | approved | rejected
      profile,
      documents: docs,
      bankDetails: bank[0] || null,
      commissionPlan: commission[0] || null,
      rejectionReason: profile.rejection_reason || null,
    });
  } catch (err) {
    console.error("Get Onboarding Status Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 1: Mess Basic Details ────────────────────────────────
exports.saveBasicDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      mess_name, owner_name, mobile, experience, description,
    } = req.body;

    if (!mess_name || !mobile)
      return res.status(400).json({ message: "Mess name and mobile are required" });

    const profileImage = req.file ? `/uploads/vendor-docs/${req.file.filename}` : null;

    const [existing] = await db.query(
      "SELECT id FROM vendor_profiles WHERE vendor_id = ?",
      [vendorId]
    );

    if (existing.length > 0) {
      const updateData = { mess_name, owner_name, mobile, experience, description };
      if (profileImage) updateData.profile_image = profileImage;
      await db.query(
        "UPDATE vendor_profiles SET ? WHERE vendor_id = ?",
        [updateData, vendorId]
      );
    } else {
      await db.query(
        `INSERT INTO vendor_profiles (vendor_id, mess_name, owner_name, mobile, experience, description, profile_image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [vendorId, mess_name, owner_name, mobile, experience || null, description, profileImage]
      );
    }

    return res.json({ message: "Basic details saved", step: 1 });
  } catch (err) {
    console.error("Save Basic Details Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 2: Service Area ──────────────────────────────────────
exports.saveServiceArea = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { address, city, state, zip, town, latitude, longitude, service_radius } = req.body;

    if (!town || !latitude || !longitude)
      return res.status(400).json({ message: "Town and location required" });

    // ✅ Safe file handling — req.files is an object with .fields(), not an array
    if (req.files) {
      const areaDoc   = req.files["area_document"]?.[0];
      const ownerIdDoc = req.files["owner_id"]?.[0];

      if (areaDoc) {
        const areaDocUrl = `/uploads/vendor-docs/${areaDoc.filename}`;
        await db.query(
          "INSERT INTO vendor_documents (vendor_id, doc_type, file_url) VALUES (?, 'area_proof', ?) ON DUPLICATE KEY UPDATE file_url=VALUES(file_url)",
          [vendorId, areaDocUrl]
        );
      }

      if (ownerIdDoc) {
        const ownerIdUrl = `/uploads/vendor-docs/${ownerIdDoc.filename}`;
        await db.query(
          "INSERT INTO vendor_documents (vendor_id, doc_type, file_url) VALUES (?, 'owner_id', ?) ON DUPLICATE KEY UPDATE file_url=VALUES(file_url)",
          [vendorId, ownerIdUrl]
        );
      }
    }

    await db.query(
      `UPDATE vendor_profiles SET address=?, city=?, state=?, zip=?, town=?, latitude=?, longitude=?, service_radius=? WHERE vendor_id=?`,
      [address, city, state, zip, town, latitude, longitude, service_radius || 2, vendorId]
    );

    return res.json({ message: "Service area saved", step: 2 });
  } catch (err) {
    console.error("Save Service Area Error:", err); // ✅ Check your terminal for the exact error
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 3: Commission Plan ───────────────────────────────────
exports.saveCommissionPlan = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { plan_type } = req.body; // 'fixed' | 'percentage'

    if (!plan_type || !["fixed", "percentage"].includes(plan_type))
      return res.status(400).json({ message: "Valid plan_type required (fixed/percentage)" });

    const rate = plan_type === "fixed" ? 10.00 : 10.00; // ₹10/order or 10%

    const [existing] = await db.query(
      "SELECT id FROM vendor_commission_plans WHERE vendor_id = ?",
      [vendorId]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE vendor_commission_plans SET plan_type=?, rate=? WHERE vendor_id=?",
        [plan_type, rate, vendorId]
      );
    } else {
      await db.query(
        "INSERT INTO vendor_commission_plans (vendor_id, plan_type, rate) VALUES (?, ?, ?)",
        [vendorId, plan_type, rate]
      );
    }

    return res.json({ message: "Commission plan saved", step: 3 });
  } catch (err) {
    console.error("Save Commission Plan Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 4: Food Type & Cuisine ──────────────────────────────
exports.saveFoodType = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { food_type, cuisine_type, uses_onion_garlic, operating_days } = req.body;

    if (!food_type)
      return res.status(400).json({ message: "Food type required" });

    const foodTypeJson = Array.isArray(food_type) ? JSON.stringify(food_type) : food_type;
    const tagsJson = JSON.stringify([]);

    await db.query(
      `UPDATE vendor_profiles SET food_type=?, cuisine_type=?, uses_onion_garlic=?, operating_days=?, tags=? WHERE vendor_id=?`,
      [foodTypeJson, cuisine_type, uses_onion_garlic === "yes" ? 1 : 0, operating_days, tagsJson, vendorId]
    );

    return res.json({ message: "Food type saved", step: 4 });
  } catch (err) {
    console.error("Save Food Type Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 5: FSSAI & Legal Docs ───────────────────────────────
exports.saveFssaiDocs = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { fssai_number, fssai_date, fssai_validity } = req.body;

    if (!fssai_number)
      return res.status(400).json({ message: "FSSAI number required" });

    // Save FSSAI info to vendor_profiles
    await db.query(
      "UPDATE vendor_profiles SET fssai_number=?, fssai_date=?, fssai_validity=? WHERE vendor_id=?",
      [fssai_number, fssai_date || null, fssai_validity || null, vendorId]
    );

    // Save uploaded documents
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = `/uploads/vendor-docs/${file.filename}`;
        const docType = file.fieldname; // fssai_certificate | gst_certificate | shop_act_license

        // Upsert — delete old then insert
        await db.query(
          "DELETE FROM vendor_documents WHERE vendor_id=? AND doc_type=?",
          [vendorId, docType]
        );
        await db.query(
          "INSERT INTO vendor_documents (vendor_id, doc_type, file_url) VALUES (?, ?, ?)",
          [vendorId, docType, fileUrl]
        );
      }
    }

    return res.json({ message: "FSSAI documents saved", step: 5 });
  } catch (err) {
    console.error("Save FSSAI Docs Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── STEP 6: Bank Details ──────────────────────────────────────
exports.saveBankDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { account_holder_name, bank_name, account_number, ifsc_code, branch_name } = req.body;

    if (!account_holder_name || !bank_name || !account_number || !ifsc_code)
      return res.status(400).json({ message: "All bank fields required" });

    const [existing] = await db.query(
      "SELECT id FROM vendor_bank_details WHERE vendor_id = ?",
      [vendorId]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE vendor_bank_details SET account_holder_name=?, bank_name=?, account_number=?, ifsc_code=?, branch_name=? WHERE vendor_id=?",
        [account_holder_name, bank_name, account_number, ifsc_code, branch_name, vendorId]
      );
    } else {
      await db.query(
        "INSERT INTO vendor_bank_details (vendor_id, account_holder_name, bank_name, account_number, ifsc_code, branch_name) VALUES (?, ?, ?, ?, ?, ?)",
        [vendorId, account_holder_name, bank_name, account_number, ifsc_code, branch_name]
      );
    }

    // Mark onboarding as complete — set status to 'pending' for admin review
    await db.query(
      "UPDATE vendor_profiles SET status='pending' WHERE vendor_id=?",
      [vendorId]
    );

    // Notify admin (insert into admin_notifications)
    await db.query(
      `INSERT INTO admin_notifications (type, message, vendor_id, is_read)
       VALUES ('onboarding_request', 'New vendor onboarding request', ?, 0)`,
      [vendorId]
    );

    return res.json({ message: "Bank details saved. Application submitted for review!", step: 6, submitted: true });
  } catch (err) {
    console.error("Save Bank Details Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── ADMIN: Approve / Reject Vendor ───────────────────────────
exports.reviewVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { action, rejection_reason } = req.body; // action: 'approved' | 'rejected'

    if (!["approved", "rejected"].includes(action))
      return res.status(400).json({ message: "action must be approved or rejected" });

    if (action === "rejected" && !rejection_reason)
      return res.status(400).json({ message: "Rejection reason required" });

    await db.query(
      "UPDATE vendor_profiles SET status=?, rejection_reason=? WHERE vendor_id=?",
      [action, action === "rejected" ? rejection_reason : null, vendorId]
    );

    // Notify vendor
    await db.query(
      `INSERT INTO vendor_notifications (vendor_id, type, message)
       VALUES (?, ?, ?)`,
      [
        vendorId,
        action,
        action === "approved"
          ? "Congratulations! Your account has been approved."
          : `Your application was rejected: ${rejection_reason}`,
      ]
    );

    return res.json({ message: `Vendor ${action} successfully` });
  } catch (err) {
    console.error("Review Vendor Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};