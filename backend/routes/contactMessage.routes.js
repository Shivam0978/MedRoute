const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");
const { verifyAuth, requireAdmin } = require("../middleware/auth");

// GET /api/contact-messages (admin)
router.get("/", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages.map((m) => m.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contact-messages (authenticated user)
router.post("/", verifyAuth, async (req, res) => {
  try {
    const { name, category, subject, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }

    const msg = new ContactMessage({
      user_id: req.user._id ? req.user._id.toString() : req.user.id,
      name: name.trim(),
      email: req.user.email,
      category: category || "general",
      subject: subject || null,
      message: message.trim(),
    });

    await msg.save();
    res.status(201).json(msg.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contact-messages/:id/resolve (admin)
router.put("/:id/resolve", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { resolved } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { resolved: resolved !== undefined ? resolved : true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
