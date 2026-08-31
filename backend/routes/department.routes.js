const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const { verifyAuth, requireAdmin } = require("../middleware/auth");

// GET /api/departments
router.get("/", async (req, res) => {
  try {
    const { hospital } = req.query;
    const filter = hospital ? { hospital_id: hospital } : {};
    const departments = await Department.find(filter).populate("hospital_id", "name city");
    res.json(
      departments.map((d) => {
        const json = d.toJSON();
        if (d.hospital_id) json.hospital = { name: d.hospital_id.name, city: d.hospital_id.city };
        return json;
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/departments (admin)
router.post("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/departments/:id (admin)
router.delete("/:id", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
