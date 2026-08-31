const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const Facility = require("../models/Facility");
const Appointment = require("../models/Appointment");
const PendingHospital = require("../models/PendingHospital");
const ContactMessage = require("../models/ContactMessage");
const { verifyAuth, requireAdmin } = require("../middleware/auth");

// GET /api/admin/analytics
router.get("/analytics", verifyAuth, requireAdmin, async (req, res) => {
  try {
    const [
      hospitalsCount,
      govtCount,
      doctorsCount,
      departmentsCount,
      facilitiesCount,
      apptsCount,
      pendingCount,
      openMsgsCount,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ is_government: true }),
      Doctor.countDocuments(),
      Department.countDocuments(),
      Facility.countDocuments(),
      Appointment.countDocuments(),
      PendingHospital.countDocuments({ status: "pending" }),
      ContactMessage.countDocuments({ resolved: false }),
    ]);

    // Top cities by hospital count
    const cityAgg = await Hospital.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topCities = cityAgg.map((item) => [item._id, item.count]);

    res.json({
      counts: {
        hospitals: hospitalsCount,
        govt_hospitals: govtCount,
        doctors: doctorsCount,
        departments: departmentsCount,
        facilities: facilitiesCount,
        appointments: apptsCount,
        pending_submissions: pendingCount,
        open_messages: openMsgsCount,
      },
      topCities,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/check
router.get("/check", verifyAuth, async (req, res) => {
  const isAdmin = req.user.role === "admin" || (req.user.email && req.user.email.toLowerCase() === "mediroutehealth@gmail.com");
  res.json({ isAdmin });
});

module.exports = router;
