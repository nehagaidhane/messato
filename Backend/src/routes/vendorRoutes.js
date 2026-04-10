const express = require("express");
const router = express.Router();

const { getVendors } = require("../controllers/vendorController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getVendors);

module.exports = router;