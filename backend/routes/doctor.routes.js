const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const { verifyAuth, requireAdmin } = require("../middleware/auth");
const SEED_DATA = require("../config/seedData");

// GET /api/doctors
router.get("/", async (req, res) => {
  try {
    const { hospital, search, specialization } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...SEED_DATA.doctors];
      if (hospital) list = list.filter((d) => d.hospital_id === hospital);
      if (specialization) list = list.filter((d) => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((d) => d.name.toLowerCase().includes(s) || d.specialization.toLowerCase().includes(s));
      }
      return res.json(list);
    }

    let filter = {};
    if (hospital) filter.hospital_id = hospital;
    if (specialization) filter.specialization = { $regex: new RegExp(specialization, "i") };
    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { specialization: { $regex: new RegExp(search, "i") } },
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate("hospital_id", "name city")
      .sort({ rating: -1 });

    if (doctors.length === 0 && !hospital && !search && !specialization) {
      return res.json(SEED_DATA.doctors);
    }

    const result = doctors.map((d) => {
      const json = d.toJSON();
      if (d.hospital_id) {
        json.hospitals = {
          name: d.hospital_id.name,
          city: d.hospital_id.city,
        };
        json.hospital = json.hospitals;
      }
      return json;
    });

    res.json(result);
  } catch (err) {
    res.json(SEED_DATA.doctors);
  }
});

// GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const found = SEED_DATA.doctors.find((d) => d.id === req.params.id || d._id === req.params.id);
      if (found) return res.json(found);
      return res.status(404).json({ error: "Doctor not found" });
    }
    const doctor = await Doctor.findById(req.params.id).populate("hospital_id", "name city");
    if (!doctor) {
      const found = SEED_DATA.doctors.find((d) => d.id === req.params.id || d._id === req.params.id);
      if (found) return res.json(found);
      return res.status(404).json({ error: "Doctor not found" });
    }

    const json = doctor.toJSON();
    if (doctor.hospital_id) {
      json.hospitals = {
        name: doctor.hospital_id.name,
        city: doctor.hospital_id.city,
      };
      json.hospital = json.hospitals;
    }
    res.json(json);
  } catch (err) {
    const found = SEED_DATA.doctors.find((d) => d.id === req.params.id || d._id === req.params.id);
    if (found) return res.json(found);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors (admin)
router.post("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/doctors/:id (admin)
router.put("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/doctors/:id (admin)
router.delete("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
