const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");                          // ← add this

const { verifyToken } = require("../middleware/authMiddleware");

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
}));

app.use(express.json());

// ← add this line — serves your uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Public Routes
app.use("/api/upload", require("../routes/uploadRoutes"));
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/vendors", require("../routes/VendorRoutes"));
app.use("/api/menu", require("../routes/MenuRoutes"));
app.use("/api/payment", require("../routes/paymentRoutes"));

// Protected Routes
app.use("/api/user", require("../routes/userRoutes"));
app.use("/api/notifications", verifyToken, require("../routes/NotificationRoutes"));
app.use("/api/orders", verifyToken, require("../routes/orderRoutes"));

module.exports = app;