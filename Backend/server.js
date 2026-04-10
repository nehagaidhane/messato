require("dotenv").config();

const app = require("./src/utils/app");   // ✅ import app
const { connectDB } = require("./src/config/db");
const cors = require("cors");
const express = require("express");
// nbn nbnb nb
const vendorRoutes = require("./src/routes/vendorRoutes");



// mnbmnbmnb

const cookieParser = require("cookie-parser");
app.use(cookieParser());
// =========================
// 🔹 Middleware
// =========================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/api/upload", require("./src/routes/uploadRoutes"));
app.use("/api/auth",require("./src/routes/authRoutes"));
app.use("/api/user",require("./src/routes/userRoutes"));
app.use("/api/vendor", vendorRoutes);
// =========================
// 🔹 DB Connection
// =========================
// 🔹 DB
connectDB();

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("🚀 Messato API Running...");
});

// 🔹 Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});