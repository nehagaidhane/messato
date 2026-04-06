// controllers/userController.js

const db = require("../config/db"); // make sure this exists

exports.saveUserLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, city, state, zip, town } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    await db.query(
      `UPDATE users
       SET latitude=?, longitude=?, address=?, city=?, state=?, zip=?, town=?
       WHERE id=?`,
      [latitude, longitude, address || "", city || "", state || "", zip || "", town || "", userId]
    );

    res.json({ message: "Location saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

