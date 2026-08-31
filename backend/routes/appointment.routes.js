const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { verifyAuth } = require("../middleware/auth");

// GET /api/appointments
router.get("/", verifyAuth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user_id: req.user._id || req.user.id };
    const appts = await Appointment.find(filter)
      .populate("doctor_id", "name specialization consultation_fee timing")
      .populate("hospital_id", "name city address")
      .sort({ createdAt: -1 });

    const result = appts.map((a) => {
      const json = a.toJSON();
      if (a.doctor_id) {
        json.doctors = {
          name: a.doctor_id.name,
          specialization: a.doctor_id.specialization,
          consultation_fee: a.doctor_id.consultation_fee,
        };
        json.doctor = json.doctors;
      }
      if (a.hospital_id) {
        json.hospitals = {
          name: a.hospital_id.name,
          city: a.hospital_id.city,
          address: a.hospital_id.address,
        };
        json.hospital = json.hospitals;
      }
      return json;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments
router.post("/", verifyAuth, async (req, res) => {
  try {
    const { doctor_id, hospital_id, appointment_date, appointment_time, patient_name, notes } = req.body;
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Missing required appointment fields" });
    }

    const appt = new Appointment({
      user_id: req.user._id || req.user.id,
      doctor_id,
      hospital_id: hospital_id || null,
      appointment_date,
      appointment_time,
      patient_name: patient_name || req.user.full_name || "Patient",
      notes: notes || "",
    });

    await appt.save();
    res.status(201).json(appt.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user_id: req.user._id || req.user.id };
    const appt = await Appointment.findOneAndDelete(filter);
    if (!appt) return res.status(404).json({ error: "Appointment not found or unauthorized" });
    res.json({ message: "Appointment cancelled successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
