const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pharmacy = require("../models/Pharmacy");
const SEED_DATA = require("../config/seedData");

// GET /api/pharmacies
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_DATA.pharmacies);
    }
    const pharmacies = await Pharmacy.find().sort({ name: 1 });
    if (pharmacies.length === 0) return res.json(SEED_DATA.pharmacies);
    res.json(pharmacies.map((p) => p.toJSON()));
  } catch (err) {
    res.json(SEED_DATA.pharmacies);
  }
});

module.exports = router;
