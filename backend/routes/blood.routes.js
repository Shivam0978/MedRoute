const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const BloodBank = require("../models/BloodBank");
const BloodDonor = require("../models/BloodDonor");
const { verifyAuth } = require("../middleware/auth");
const SEED_DATA = require("../config/seedData");

// GET /api/blood_banks
router.get("/blood_banks", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_DATA.blood_banks);
    }
    const banks = await BloodBank.find().sort({ name: 1 });
    if (banks.length === 0) return res.json(SEED_DATA.blood_banks);
    res.json(banks.map((b) => b.toJSON()));
  } catch (err) {
    res.json(SEED_DATA.blood_banks);
  }
});

// GET /api/blood_donors (auth required to view donor contacts)
router.get("/blood_donors", verifyAuth, async (req, res) => {
  try {
    const { blood_group, city } = req.query;
    let filter = {};
    if (blood_group) filter.blood_group = blood_group.trim();
    if (city) filter.city = { $regex: new RegExp(city.trim(), "i") };

    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const donors = await BloodDonor.find(filter).sort({ name: 1 });
    res.json(donors.map((d) => d.toJSON()));
  } catch (err) {
    res.json([]);
  }
});

// POST /api/blood_donors (auth required to register)
router.post("/blood_donors", verifyAuth, async (req, res) => {
  try {
    const { name, blood_group, city, phone } = req.body;
    if (!name || !blood_group || !city || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const donor = new BloodDonor({
      user_id: req.user._id ? req.user._id.toString() : req.user.id,
      name: name.trim(),
      blood_group: blood_group.trim(),
      city: city.trim(),
      phone: phone.trim(),
    });

    if (mongoose.connection.readyState === 1) {
      await donor.save();
    }
    res.status(201).json(donor.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
