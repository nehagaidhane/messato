const db = require("../config/db");

exports.submitVendor = async (req, res) => {
  try {
    const data = req.body;

    console.log("BODY:", data);
    console.log("FILES:", req.files);

    // ✅ 1. Insert into vendors table
    const [vendorResult] = await db.query(
      `INSERT INTO vendors (name, email, password, status) VALUES (?, ?, ?, ?)`,
      [
        data.messName || "",
        data.email || "",
        "123456", // temp password
        "pending"
      ]
    );

    const vendorId = vendorResult.insertId;

    // ✅ 2. Insert into vendor_profiles
    await db.query(
      `INSERT INTO vendor_profiles 
      (vendor_id, mess_name, owner_name, mobile, description, address, town, service_radius, food_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendorId,
        data.messName || "",
        data.ownerName || "",
        data.mobile || "",
        data.description || "",
        data.location || "",
        data.town || "",
        data.radius || "",
        JSON.stringify(data.foodTypes || [])
      ]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("ERROR:", err); // 👈 CHECK THIS IN TERMINAL
    res.status(500).json({ error: err.message });
  }
};