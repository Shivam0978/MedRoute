const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");
const { verifyAuth } = require("../middleware/auth");

// GET /api/health-records (user only sees their own)
router.get("/", verifyAuth, async (req, res) => {
  try {
    const records = await HealthRecord.find({ user_id: req.user._id || req.user.id }).sort({ created_at: -1 });
    res.json(records.map((r) => r.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/health-records
router.post("/", verifyAuth, async (req, res) => {
  try {
    const { title, record_type, notes, file_url } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const record = new HealthRecord({
      user_id: req.user._id || req.user.id,
      title: title.trim(),
      record_type: record_type || "prescription",
      notes: notes || "",
      file_url: file_url || null,
    });

    await record.save();
    res.status(201).json(record.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/health-records/:id
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id || req.user.id,
    });
    if (!record) return res.status(404).json({ error: "Record not found or unauthorized" });
    res.json({ message: "Record deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
