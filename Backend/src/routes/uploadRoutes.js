const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.json({
      message: "Image uploaded",
      url: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;