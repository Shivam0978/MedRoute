const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "mediroute-sih-jwt-secret-key-2026";

const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // If database is connected, query full user object
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (dbErr) {
        console.warn("[Auth Middleware] User lookup fallback:", dbErr.message);
      }
    }

    // Fallback: use decoded token payload so frontend session never crashes
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || (decoded.email === "mediroutehealth@gmail.com" ? "admin" : "user"),
      full_name: decoded.full_name || decoded.email?.split("@")[0] || "User",
      toJSON() {
        return {
          id: this.id,
          email: this.email,
          role: this.role,
          full_name: this.full_name,
        };
      },
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const isSuperAdmin = req.user.email && req.user.email.toLowerCase() === "mediroutehealth@gmail.com";
  if (req.user.role !== "admin" && !isSuperAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = {
  verifyAuth,
  requireAdmin,
  JWT_SECRET,
};
