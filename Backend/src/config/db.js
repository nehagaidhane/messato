const mysql = require("mysql2/promise");

if (!process.env.MYSQL_SERVICE_URL) {
  throw new Error("❌ MYSQL_SERVICE_URL missing in .env");
}

const db = mysql.createPool({
  uri: process.env.MYSQL_SERVICE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "+05:30",
});

// ✅ ADD THIS FUNCTION
const connectDB = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL Connected");
    connection.release();
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

// ✅ EXPORT BOTH
module.exports = { db, connectDB };