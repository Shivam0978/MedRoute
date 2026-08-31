require("dotenv").config();
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");
const connectDB = require("./config/db");

// Import Route Handlers
const authRoutes = require("./routes/auth.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const doctorRoutes = require("./routes/doctor.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const departmentRoutes = require("./routes/department.routes");
const facilityRoutes = require("./routes/facility.routes");
const pendingHospitalRoutes = require("./routes/pendingHospital.routes");
const contactMessageRoutes = require("./routes/contactMessage.routes");
const bloodRoutes = require("./routes/blood.routes");
const pharmacyRoutes = require("./routes/pharmacy.routes");
const schemeRoutes = require("./routes/scheme.routes");
const emergencyRoutes = require("./routes/emergency.routes");
const healthRecordRoutes = require("./routes/healthRecord.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "MediRoute Node.js/Express + MongoDB Backend API is running!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/pending-hospitals", pendingHospitalRoutes);
app.use("/api/contact-messages", contactMessageRoutes);
app.use("/api", bloodRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api", emergencyRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/admin", adminRoutes);

// AI Symptom Assistant streaming endpoint
app.post("/api/symptom-assistant", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const pythonExec = path.join(__dirname, "venv", "Scripts", "python.exe");
    const pythonScript = path.join(__dirname, "ai_agent.py");

    const fs = require("fs");
    if (!fs.existsSync(pythonExec) || !fs.existsSync(pythonScript)) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "health query";
      const fallbackResponse = `**What it could be:** Possible seasonal symptoms or mild infection based on "${lastUserMsg}".\n\n**Try at home:**\n- Get plenty of rest and hydrate.\n- Warm saline gargles or steam inhalation if you have cough/throat irritation.\n\n**Go to doctor if:** Fever exceeds 102°F or persists for more than 3 days.\n\n**Which doctor:** General Physician.\n\n_This is general help only, not a doctor's advice. In emergency call 102._`;

      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: fallbackResponse } }] })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const pyProcess = spawn(pythonExec, [pythonScript]);

    pyProcess.stdin.write(JSON.stringify(messages));
    pyProcess.stdin.end();

    pyProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (let line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (!parsed.error) {
              res.write(`data: ${line}\n\n`);
            }
          } catch (e) {
            // malformed or raw line
          }
        }
      }
    });

    pyProcess.stderr.on("data", (data) => {
      console.warn(`[AI Agent Stderr]: ${data}`);
    });

    pyProcess.on("close", () => {
      res.write("data: [DONE]\n\n");
      res.end();
    });
  } catch (error) {
    console.error("[Symptom Assistant Error]:", error);
    res.status(500).json({ error: "AI Assistant internal error" });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[MediRoute] Express server listening on http://localhost:${PORT}`);
});

module.exports = app;
