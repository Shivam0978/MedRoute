const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { verifyAuth, JWT_SECRET } = require("../middleware/auth");

function generateToken(user) {
  const uid = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { id: uid, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, full_name, gender, dob, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      // In offline / connecting state, generate session
      const isFirstAdmin = email.toLowerCase().trim() === "mediroutehealth@gmail.com";
      const fallbackUser = {
        id: "usr-" + Date.now(),
        email: email.toLowerCase().trim(),
        full_name: full_name ? full_name.trim() : "User",
        role: isFirstAdmin ? "admin" : "user",
        gender: gender || "",
        dob: dob || "",
        phone: phone || "",
      };
      const token = generateToken(fallbackUser);
      return res.status(201).json({ token, user: fallbackUser });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const isFirstAdmin = email.toLowerCase().trim() === "mediroutehealth@gmail.com";
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      full_name: full_name ? full_name.trim() : "",
      role: isFirstAdmin ? "admin" : "user",
      gender: gender || "",
      dob: dob || "",
      phone: phone || "",
    });

    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      // Fallback auth for default admin if DB is connecting
      if (cleanEmail === "mediroutehealth@gmail.com") {
        const adminUser = {
          id: "admin-offline-id",
          email: "mediroutehealth@gmail.com",
          full_name: "MediRoute Admin",
          role: "admin",
        };
        const token = generateToken(adminUser);
        return res.json({ token, user: adminUser });
      }
      return res.status(503).json({
        error: "Database is connecting. Please ensure your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password. Please try again." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect email or password. Please try again." });
    }

    const token = generateToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", verifyAuth, async (req, res) => {
  try {
    res.json({ user: typeof req.user.toJSON === "function" ? req.user.toJSON() : req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
