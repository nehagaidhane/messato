module.exports = {
  accessSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiry: process.env.JWT_EXPIRES,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRES,
};
