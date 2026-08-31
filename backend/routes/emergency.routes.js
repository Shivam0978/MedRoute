const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const EmergencyContact = require("../models/EmergencyContact");
const SEED_DATA = require("../config/seedData");

// GET /api/emergency_contacts
router.get("/emergency_contacts", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_DATA.emergency_contacts);
    }
    const contacts = await EmergencyContact.find().sort({ label: 1 });
    if (contacts.length === 0) return res.json(SEED_DATA.emergency_contacts);
    res.json(contacts.map((c) => c.toJSON()));
  } catch (err) {
    res.json(SEED_DATA.emergency_contacts);
  }
});

module.exports = router;
