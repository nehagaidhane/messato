// controllers/userController.js

const db = require("../config/db"); // make sure this exists

exports.saveUserLocation = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user); // 👈 IMPORTANT

    const userId = req.user.id;

    await db.query(
      `UPDATE users 
       SET latitude=?, longitude=?, address=?, city=?, state=?, zip=?, town=?
       WHERE id=?`,
      [
        req.body.latitude,
        req.body.longitude,
        req.body.address,
        req.body.city,
        req.body.state,
        req.body.zip,
        req.body.town,
        userId
      ]
    );

    res.json({ message: "Location saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving location" });
  }
};

