// ✅ MUST BE FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./src/config/db");

// nbn nbnb nb
const vendorRoutes = require("./src/routes/vendorRoutes");


// mnbmnbmnb

const app = express();
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
connectDB();

app.get("/", (req, res) => {
  res.send("🚀 Messato API Running...");
});

// =========================
// 🔹 Server
// =========================
const PORT = process.env.PORT ||5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
