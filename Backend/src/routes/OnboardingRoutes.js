
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/OnboardingController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// All vendor routes require auth
const vendorAuth = [verifyToken, requireRole("vendor")];
const adminAuth  = [verifyToken, requireRole("admin")];

// ── Get current onboarding status ──────────────────────────────
router.get("/status", vendorAuth, ctrl.getOnboardingStatus);

// ── Step 1: Basic Details (with optional profile image upload) ─
router.post(
  "/step/1",
  vendorAuth,
  ctrl.upload.single("profile_image"),
  ctrl.saveBasicDetails
);

// ── Step 2: Service Area (area_document + owner_id) ────────────
router.post(
  "/step/2",
  vendorAuth,
  ctrl.upload.fields([
    { name: "area_document", maxCount: 1 },
    { name: "owner_id",      maxCount: 1 },
  ]),
  ctrl.saveServiceArea
);

// ── Step 3: Commission Plan ────────────────────────────────────
router.post("/step/3", vendorAuth, ctrl.saveCommissionPlan);

// ── Step 4: Food Type & Cuisine ────────────────────────────────
router.post("/step/4", vendorAuth, ctrl.saveFoodType);

// ── Step 5: FSSAI & Legal Docs ─────────────────────────────────
router.post(
  "/step/5",
  vendorAuth,
  ctrl.upload.fields([
    { name: "fssai_certificate",  maxCount: 1 },
    { name: "gst_certificate",    maxCount: 1 },
    { name: "shop_act_license",   maxCount: 1 },
  ]),
  ctrl.saveFssaiDocs
);

// ── Step 6: Bank Details (final submit) ───────────────────────
router.post("/step/6", vendorAuth, ctrl.saveBankDetails);

// ── ADMIN: Review (approve/reject) ────────────────────────────
router.post("/review/:vendorId", adminAuth, ctrl.reviewVendor);

module.exports = router;