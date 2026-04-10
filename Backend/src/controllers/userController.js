// controllers/userController.js

const { db } = require("../config/db"); // ✅ destructure { db }

exports.saveUserLocation = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const userId = req.user.id;

    await db.query(
      `UPDATE users 
       SET latitude=?, longitude=?, address=?, city=?, state=?, pincode=?, town=?
       WHERE id=?`,
      [
        req.body.latitude,
        req.body.longitude,
        req.body.address,
        req.body.city,
        req.body.state,
        req.body.pincode,  // ✅ fixed: was req.body.zip (column doesn't exist)
        req.body.town,
        userId
      ]
    );

    res.json({ message: "Location saved" });

  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ message: "Error saving location", detail: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName, lastName, email, phone,
      dob, gender, bio, address, city,
      pincode, latitude, longitude
    } = req.body;

    await db.query(
      `UPDATE users 
       SET first_name=?, last_name=?, email=?, phone=?, 
           dob=?, gender=?, bio=?, address=?, city=?, 
           pincode=?, latitude=?, longitude=?
       WHERE id=?`,
      [
        firstName  || null,
        lastName   || null,
        email      || null,
        phone      || null,
        dob        || null,
        gender     || null,
        bio        || null,
        address    || null,
        city       || null,
        pincode    || null,
        latitude   || null,
        longitude  || null,
        userId
      ]
    );

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ message: "Error updating profile", detail: err.message });
  }
};const { db } = require("../config/db");

// ================= GET USERS =================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(users);

  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};