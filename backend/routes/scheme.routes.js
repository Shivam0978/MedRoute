const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");
const SEED_DATA = require("../config/seedData");

// GET /api/schemes
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_DATA.schemes);
    }
    const schemes = await Scheme.find().sort({ name: 1 });
    if (schemes.length === 0) return res.json(SEED_DATA.schemes);
    res.json(schemes.map((s) => s.toJSON()));
  } catch (err) {
    res.json(SEED_DATA.schemes);
  }
});

module.exports = router;
