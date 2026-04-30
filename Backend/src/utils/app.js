// core imports
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// middleware
const { verifyToken } = require("../middleware/authMiddleware");

// app init
const app = express();


// ─────────────────────────────────────────────
// ✅ GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
}));


// ─────────────────────────────────────────────
// ✅ STATIC FILES
// ─────────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);


// ─────────────────────────────────────────────
// ✅ PUBLIC ROUTES (NO AUTH)
// ─────────────────────────────────────────────
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/upload", require("../routes/uploadRoutes"));
app.use("/api/vendors", require("../routes/vendorRoutes"));
app.use("/api/menu", require("../routes/menuRoutes"));
app.use("/api/payment", require("../routes/paymentRoutes"));
app.use("/api/onboarding", require("../routes/OnboardingRoutes"));
app.use("/api/admin", require("../routes/adminRoutes"));


// ─────────────────────────────────────────────
// ✅ PROTECTED VENDOR ROUTES
// ─────────────────────────────────────────────
app.use("/api/dashboard", verifyToken, require("../routes/vendorDashboardRoutes"));
app.use("/api/vendor-orders", verifyToken, require("../routes/vendorOrderRoutes"));
app.use("/api/vendor-menu", verifyToken, require("../routes/VendorMenuRoutes"));
app.use("/api/vendor-profile", verifyToken, require("../routes/Vendorprofileroutes"));
app.use("/api/vendor/settings", verifyToken, require("../routes/setting"));
app.use("/api/vendor/support", verifyToken, require("../routes/support"));


// ─────────────────────────────────────────────
// ✅ USER ROUTES
// ─────────────────────────────────────────────
app.use("/api/user", require("../routes/userRoutes"));
app.use("/api/orders", verifyToken, require("../routes/orderRoutes"));
app.use("/api/notifications", verifyToken, require("../routes/NotificationRoutes"));


// ─────────────────────────────────────────────
// ✅ HEALTH CHECK (optional but useful)
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running 🚀" });
});


// ─────────────────────────────────────────────
// ❌ 404 HANDLER (IMPORTANT)
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});


// ─────────────────────────────────────────────
// ❌ GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("API Error:", {
    message: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage,
  });

  res.status(500).json({
    message: err.message || "Server error",
  });
});


module.exports = app;