const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isProduction = process.env.NODE_ENV === "production";
const DEFAULT_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const parseExpiryToMs = (value, fallback = DEFAULT_REFRESH_MS) => {
  if (!value || typeof value !== "string") return fallback;

  const normalized = value.trim();
  if (!normalized) return fallback;

  const plainNumber = Number(normalized);
  if (Number.isFinite(plainNumber) && plainNumber > 0) {
    return plainNumber * 1000;
  }

  const match = normalized.match(/^(\d+)([smhdw])$/i);
  if (!match) return fallback;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitToMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * (unitToMs[unit] || 1000);
};

const REFRESH_COOKIE_MAX_AGE = parseExpiryToMs(process.env.JWT_REFRESH_EXPIRES);

const buildRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: "/api/auth",
});

// ─────────────────────────────────────────────────────────────
// Nodemailer transporter  (configure your SMTP in .env)
// ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",                         // or "smtp.mailtrap.io" for testing
  auth: {
    user: process.env.MAIL_USER,            // your Gmail address
    pass: process.env.MAIL_PASS,            // Gmail App Password (not your real password)
  },
});

// ─────────────────────────────────────────────────────────────
// Helper — sign access token
// Pass longExpiry = true when "Remember me" is checked
// ─────────────────────────────────────────────────────────────
const signToken = (id, type, longExpiry = false) =>
  jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: longExpiry ? "30d" : process.env.JWT_EXPIRES }
  );

// ═════════════════════════════════════════════════════════════
// USER SIGNUP
// ═════════════════════════════════════════════════════════════
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?", [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup User Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ═════════════════════════════════════════════════════════════
// VENDOR SIGNUP
// ═════════════════════════════════════════════════════════════
exports.signupVendor = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const [existing] = await db.query(
      "SELECT id FROM vendors WHERE email = ?", [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO vendors (name, email, password, status) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "incomplete"]
    );

    return res.status(201).json({ message: "Vendor registered successfully" });
  } catch (err) {
    console.error("Signup Vendor Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ═════════════════════════════════════════════════════════════
// USER / ADMIN LOGIN  (+ Remember Me support)
// ═════════════════════════════════════════════════════════════
exports.userLogin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    let user;
    let userType = "user";
    let role = "user";

    // 🔍 1. Check admins table first
    const [admins] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (admins.length > 0) {
      user = admins[0];
      userType = "admin";
      role = user.role || "admin";
    } else {
      // 🔍 2. Then check users
   console.log("LOGIN BODY:", req.body);

const [users] = await db.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
);

console.log("FOUND USERS:", users);

      if (users.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      user = users[0];
      role = user.role || "user";
    }

    // 🔐 Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // 🚫 OPTIONAL: block inactive accounts
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account inactive" });
    }

    const tokenPayload = { id: user.id, type: userType, role };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    const refreshCookieName = userType === "admin" ? "adminRefreshToken" : "refreshToken";

    res.cookie(refreshCookieName, refreshToken, buildRefreshCookieOptions());

    return res.json({
      message: `${userType === "admin" ? "Admin" : "User"} login successful`,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: userType,
        role,
      },
    });
  } catch (err) {
    console.error("User Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ═════════════════════════════════════════════════════════════
// VENDOR LOGIN
// ═════════════════════════════════════════════════════════════
exports.vendorLogin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    console.log("LOGIN BODY:", req.body);

    const [vendors] = await db.query(
      "SELECT * FROM vendors WHERE email = ?",
      [email]
    );

    console.log("FOUND VENDOR:", vendors);

    if (vendors.length === 0)
      return res.status(400).json({ message: "Vendor not found" });

    const vendor = vendors[0];

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    if (vendor.status === "inactive") {
      return res.status(403).json({ message: "Account inactive" });
    }

    // ✅ NEW: fetch onboarding status
    const [profile] = await db.query(
      "SELECT status FROM vendor_profiles WHERE vendor_id = ?",
      [vendor.id]
    );

    const onboardingStatus =
      profile.length > 0 ? profile[0].status : "not_started";

    const tokenPayload = { id: vendor.id, type: "vendor", role: "vendor" };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    res.cookie("vendorRefreshToken", refreshToken, buildRefreshCookieOptions());

    return res.json({
      message: "Vendor login successful",
      accessToken,
      user: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        type: "vendor",
      },
      rememberMe: Boolean(rememberMe),
      onboardingStatus, // ✅ NEW FIELD
    });

  } catch (err) {
    console.error("Vendor Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ═════════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═════════════════════════════════════════════════════════════
const issueRefreshAccessToken = (req, res, cookieName, expectedType) => {
  const token = req.cookies?.[cookieName];
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { id, type, role } = user;

    if (expectedType && type !== expectedType) {
      return res.status(403).json({ message: "Invalid refresh token type" });
    }

    const newAccessToken = jwt.sign(
      { id, type, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const rotatedRefreshToken = jwt.sign(
      { id, type, role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    res.cookie(cookieName, rotatedRefreshToken, buildRefreshCookieOptions());

    return res.json({ accessToken: newAccessToken });
  });
};

exports.refreshToken = (req, res) => issueRefreshAccessToken(req, res, "refreshToken", "user");
exports.refreshAdminToken = (req, res) => issueRefreshAccessToken(req, res, "adminRefreshToken", "admin");
exports.refreshVendorToken = (req, res) => issueRefreshAccessToken(req, res, "vendorRefreshToken", "vendor");
exports.userLogout = (req, res) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ message: "User logout successful" });
};

exports.vendorLogout = (req, res) => {
  res.clearCookie("vendorRefreshToken", {
    path: "/api/auth",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ message: "Vendor logout successful" });
};

// ═════════════════════════════════════════════════════════════
// GOOGLE LOGIN
// ═════════════════════════════════════════════════════════════
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Token missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );

    let user;
    if (users.length === 0) {
      const [result] = await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, null]
      );
      user = { id: result.insertId };
    } else {
      user = users[0];
    }

    const accessToken = signToken(user.id, "user");

    return res.json({
      message: "Google login successful",
      accessToken,
      type: "user",
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(401).json({ message: "Access denied" });
  }
};

// ═════════════════════════════════════════════════════════════
// FACEBOOK LOGIN
// How it works:
//   1. Frontend gets accessToken + userID from Facebook JS SDK
//   2. We verify with Graph API → get real email + name
//   3. Find or create user in DB → issue JWT
// ═════════════════════════════════════════════════════════════
exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken: fbToken, userID } = req.body;

    if (!fbToken || !userID)
      return res.status(400).json({ message: "Facebook token and userID required" });

    // Verify token with Facebook Graph API
    const graphRes = await axios.get(
      `https://graph.facebook.com/v19.0/${userID}`,
      {
        params: {
          fields: "id,name,email",
          access_token: fbToken,
        },
      }
    );

    const { id: fbId, name, email } = graphRes.data;

    // Some users don't grant email permission — handle gracefully
    if (!email)
      return res.status(400).json({
        message: "Facebook account has no email. Please use email login or Google.",
      });

    // Find or create user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );

    let user;
    if (users.length === 0) {
      const [result] = await db.query(
        "INSERT INTO users (name, email, password, facebook_id) VALUES (?, ?, ?, ?)",
        [name, email, null, fbId]
      );
      user = { id: result.insertId };
    } else {
      user = users[0];
      // Save facebook_id if not stored yet
      if (!user.facebook_id) {
        await db.query(
          "UPDATE users SET facebook_id = ? WHERE id = ?",
          [fbId, user.id]
        );
      }
    }

    const accessToken = signToken(user.id, "user");

    return res.json({
      message: "Facebook login successful",
      accessToken,
      type: "user",
    });
  } catch (err) {
    console.error("Facebook Login Error:", err.response?.data || err.message);
    return res.status(401).json({ message: "Facebook login failed" });
  }
};

// ═════════════════════════════════════════════════════════════
// APPLE LOGIN
// How it works:
//   1. Frontend gets identityToken from Apple JS SDK
//   2. We verify the JWT with Apple's public keys
//   3. Find or create user → issue JWT
//
// NOTE: Apple only sends name on the FIRST login ever.
//       On subsequent logins only email (or private relay) is in the token.
// ═════════════════════════════════════════════════════════════
exports.appleLogin = async (req, res) => {
  try {
    const { identityToken, fullName } = req.body;

    if (!identityToken)
      return res.status(400).json({ message: "Apple identity token required" });

    // Fetch Apple's public keys
    const { data: appleKeys } = await axios.get(
      "https://appleid.apple.com/auth/keys"
    );

    // Decode token header to find which key to use
    const tokenHeader = JSON.parse(
      Buffer.from(identityToken.split(".")[0], "base64").toString("utf8")
    );

    const matchingKey = appleKeys.keys.find(k => k.kid === tokenHeader.kid);
    if (!matchingKey)
      return res.status(401).json({ message: "Apple key not found" });

    // Build PEM from Apple JWK
    const jwkToPem = require("jwk-to-pem");
    const pem = jwkToPem(matchingKey);

    // Verify the identity token
    const decoded = jwt.verify(identityToken, pem, {
      algorithms: ["RS256"],
      audience: process.env.APPLE_CLIENT_ID,  // your Apple Services ID
      issuer: "https://appleid.apple.com",
    });

    const appleUserId = decoded.sub;
    const email = decoded.email;

    // Apple may not always return email (private relay or repeat login)
    if (!email)
      return res.status(400).json({
        message: "No email returned from Apple. Try email login.",
      });

    const name = fullName
      ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
      : null;

    // Find or create user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? OR apple_id = ?",
      [email, appleUserId]
    );

    let user;
    if (users.length === 0) {
      const [result] = await db.query(
        "INSERT INTO users (name, email, password, apple_id) VALUES (?, ?, ?, ?)",
        [name || "Apple User", email, null, appleUserId]
      );
      user = { id: result.insertId };
    } else {
      user = users[0];
      if (!user.apple_id) {
        await db.query(
          "UPDATE users SET apple_id = ? WHERE id = ?",
          [appleUserId, user.id]
        );
      }
    }

    const accessToken = signToken(user.id, "user");

    return res.json({
      message: "Apple login successful",
      accessToken,
      type: "user",
    });
  } catch (err) {
    console.error("Apple Login Error:", err.message);
    return res.status(401).json({ message: "Apple login failed" });
  }
};

// ═════════════════════════════════════════════════════════════
// FORGOT PASSWORD — send reset email
// ═════════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );

    // Always return success to prevent email enumeration
    if (users.length === 0)
      return res.json({ message: "If this email exists, a reset link has been sent." });

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token + expiry to DB
    // Make sure your users table has: reset_token VARCHAR(255), reset_token_expiry DATETIME
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [resetToken, resetExpiry, email]
    );

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"FoodApp" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1a73e8">Reset Your Password</h2>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block;background:#1a73e8;color:#fff;padding:12px 28px;
                    border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#888;font-size:13px">If you didn't request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee"/>
          <p style="color:#aaa;font-size:12px">© FoodApp</p>
        </div>
      `,
    });

    return res.json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ═════════════════════════════════════════════════════════════
// RESET PASSWORD — consume token and set new password
// ═════════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // Find user with valid (not expired) token
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (users.length === 0)
      return res.status(400).json({ message: "Reset link is invalid or expired" });

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

