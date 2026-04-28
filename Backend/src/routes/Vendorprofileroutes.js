const express = require("express");
const router = express.Router();
const { verifyToken, isVendor } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/Vendorprofilecontroller");

// All routes require vendor auth
router.use(verifyToken, isVendor);

router.get("/profile",       ctrl.getProfile);
router.put("/profile",       ctrl.updateProfile);
router.get("/documents",     ctrl.getDocuments);
router.get("/subscribers",   ctrl.getSubscribers);
router.get("/payouts",       ctrl.getPayouts);
router.get("/complaints",    ctrl.getComplaints);
router.post("/holiday",      ctrl.markHoliday);

module.exports = router;

// In your main app.js / server.js, add:
// const vendorProfileRoutes = require("./routes/vendorProfileRoutes");
// app.use("/api/vendor", vendorProfileRoutes);