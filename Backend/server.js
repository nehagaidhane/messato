require("dotenv").config();

const app = require("./src/utils/app");   // ✅ import app
const { connectDB } = require("./src/config/db");

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