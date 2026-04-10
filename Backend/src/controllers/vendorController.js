const { db } = require("../config/db");

exports.submitVendor = async (req, res) => {
  try {
    const data = req.body;

    console.log("BODY:", data);
    console.log("FILES:", req.files);

const foodTypes = Array.isArray(data.foodTypes)
  ? data.foodTypes
  : [data.foodTypes];

JSON.stringify(foodTypes)

    const [vendorResult] = await db.query(
      `INSERT INTO vendors (name, email, password, status) VALUES (?, ?, ?, ?)`,
      [
        data.messName || "",
        data.email || "",
        "123456",
        "pending"
      ]
    );

    const vendorId = vendorResult.insertId;
    const radiusValue = parseInt(data.radius) || 0;
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
    radiusValue,
    JSON.stringify(foodTypes)
  ]
);

    res.json({ success: true });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};