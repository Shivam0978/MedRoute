const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");
const { verifyAuth, requireAdmin } = require("../middleware/auth");
const SEED_DATA = require("../config/seedData");

// GET /api/hospitals
router.get("/", async (req, res) => {
  try {
    const { ids, emergency, city, specialty, govt } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...SEED_DATA.hospitals];
      if (ids) {
        const idList = ids.split(",").map((i) => i.trim());
        list = list.filter((h) => idList.includes(h.id) || idList.includes(h._id));
      }
      if (emergency === "true") list = list.filter((h) => h.emergency_24x7);
      if (govt === "true") list = list.filter((h) => h.is_government);
      if (city) list = list.filter((h) => h.city.toLowerCase() === city.toLowerCase());
      if (specialty) list = list.filter((h) => (h.specialties || []).some((s) => s.toLowerCase().includes(specialty.toLowerCase())));
      return res.json(list);
    }

    let filter = {};
    if (ids) {
      const idList = ids.split(",").map((i) => i.trim()).filter(Boolean);
      filter._id = { $in: idList };
    }
    if (emergency === "true") filter.emergency_24x7 = true;
    if (govt === "true") filter.is_government = true;
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    if (specialty) filter.specialties = { $regex: new RegExp(specialty, "i") };

    const hospitals = await Hospital.find(filter).sort({ rating: -1 });
    if (hospitals.length === 0 && !ids && !city && !specialty) {
      return res.json(SEED_DATA.hospitals);
    }
    res.json(hospitals.map((h) => h.toJSON()));
  } catch (err) {
    res.json(SEED_DATA.hospitals);
  }
});

// GET /api/hospitals/brief
router.get("/brief", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_DATA.hospitals.map((h) => ({ id: h.id, name: h.name, city: h.city })));
    }
    const hospitals = await Hospital.find({}, "_id name city").sort({ name: 1 });
    if (hospitals.length === 0) {
      return res.json(SEED_DATA.hospitals.map((h) => ({ id: h.id, name: h.name, city: h.city })));
    }
    res.json(hospitals.map((h) => ({ id: h._id.toString(), name: h.name, city: h.city })));
  } catch (err) {
    res.json(SEED_DATA.hospitals.map((h) => ({ id: h.id, name: h.name, city: h.city })));
  }
});

// GET /api/hospitals/:id
router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const found = SEED_DATA.hospitals.find((h) => h.id === req.params.id || h._id === req.params.id);
      if (found) return res.json(found);
      return res.status(404).json({ error: "Hospital not found" });
    }
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const found = SEED_DATA.hospitals.find((h) => h.id === req.params.id || h._id === req.params.id);
      if (found) return res.json(found);
      return res.status(404).json({ error: "Hospital not found" });
    }
    res.json(hospital.toJSON());
  } catch (err) {
    const found = SEED_DATA.hospitals.find((h) => h.id === req.params.id || h._id === req.params.id);
    if (found) return res.json(found);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hospitals (admin)
router.post("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hospitals/:id (admin)
router.put("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    res.json(hospital.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hospitals/:id (admin)
router.delete("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    res.json({ message: "Hospital deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
