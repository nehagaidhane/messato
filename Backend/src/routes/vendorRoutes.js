const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { submitVendor } = require("../controllers/vendorController");

router.post(
  "/submit",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "fssaiCert", maxCount: 1 },
    { name: "gstCert", maxCount: 1 },
    { name: "shopAct", maxCount: 1 }
  ]),
  submitVendor
);

module.exports = router;