const express = require("express");
const router = express.Router();
const PendingHospital = require("../models/PendingHospital");
const Hospital = require("../models/Hospital");
const { verifyAuth, requireAdmin } = require("../middleware/auth");

// GET /api/pending-hospitals (admin)
router.get("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const list = await PendingHospital.find().sort({ createdAt: -1 });
    res.json(list.map((p) => p.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pending-hospitals (authenticated user)
router.post("/", verifyAuth, async (req, res) => {
  try {
    const submission = new PendingHospital({
      ...req.body,
      submitted_by: req.user._id ? req.user._id.toString() : req.user.id,
      submitter_email: req.user.email,
    });
    await submission.save();
    res.status(201).json(submission.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pending-hospitals/:id/approve (admin)
router.post("/:id/approve", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const pending = await PendingHospital.findById(req.params.id);
    if (!pending) return res.status(404).json({ error: "Pending hospital not found" });

    // Create the approved hospital
    const newHospital = new Hospital({
      name: pending.name,
      city: pending.city,
      address: pending.address || "",
      phone: pending.phone || "",
      specialties: pending.specialties || [],
      emergency_24x7: pending.emergency_24x7,
      has_icu: pending.has_icu,
      has_mri: pending.has_mri,
      has_ambulance: pending.has_ambulance,
      is_government: pending.is_government,
      ayushman: pending.ayushman,
      lat: pending.lat,
      lng: pending.lng,
      rating: 4.0,
      cost_tier: "medium",
    });

    await newHospital.save();
    pending.status = "approved";
    await pending.save();

    res.json({ message: "Hospital approved and added to directory", hospital: newHospital.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pending-hospitals/:id/reject (admin)
router.post("/:id/reject", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const pending = await PendingHospital.findById(req.params.id);
    if (!pending) return res.status(404).json({ error: "Pending hospital not found" });

    pending.status = "rejected";
    await pending.save();
    res.json({ message: "Submission rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
