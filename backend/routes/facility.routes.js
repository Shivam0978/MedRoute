const express = require("express");
const router = express.Router();
const Facility = require("../models/Facility");
const { verifyAuth, requireAdmin } = require("../middleware/auth");

// GET /api/facilities
router.get("/", async (req, res) => {
  try {
    const { hospital } = req.query;
    const filter = hospital ? { hospital_id: hospital } : {};
    const facilities = await Facility.find(filter).populate("hospital_id", "name city");
    res.json(
      facilities.map((f) => {
        const json = f.toJSON();
        if (f.hospital_id) json.hospital = { name: f.hospital_id.name, city: f.hospital_id.city };
        return json;
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/facilities (admin)
router.post("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const facility = new Facility(req.body);
    await facility.save();
    res.status(201).json(facility.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/facilities/:id (admin)
router.delete("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ error: "Facility not found" });
    res.json({ message: "Facility deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
