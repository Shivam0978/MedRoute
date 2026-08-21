require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify Supabase Auth Token
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No authorization header" });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
};

// GET /api/hospitals
app.get("/api/hospitals", async (req, res) => {
  const { ids, emergency } = req.query;
  try {
    let query = supabase.from("hospitals").select("*, beds(*)").order("rating", { ascending: false });
    if (ids) {
      query = query.in("id", ids.split(","));
    }
    if (emergency === 'true') {
      query = query.eq("emergency_24x7", true).limit(6);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/hospitals/brief", async (req, res) => {
  try {
    const { data, error } = await supabase.from("hospitals").select("id,name").order("name");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors
app.get("/api/doctors", async (req, res) => {
  try {
    let query = supabase.from("doctors").select("*, hospitals(name, city)").order("rating", { ascending: false });
    if (req.query.hospital) {
      query = query.eq("hospital_id", req.query.hospital);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/doctors/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("doctors").select("*, hospitals(name, city)").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blood_banks
app.get("/api/blood_banks", async (req, res) => {
  try {
    const { data, error } = await supabase.from("blood_banks").select("*").order("name");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/emergency_contacts", async (req, res) => {
  try {
    const { data, error } = await supabase.from("emergency_contacts").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/pharmacies", async (req, res) => {
  try {
    const { data, error } = await supabase.from("pharmacies").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/schemes", async (req, res) => {
  try {
    const { data, error } = await supabase.from("schemes").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic generic GET for simple tables
app.get("/api/:table", async (req, res) => {
  try {
    const { data, error } = await supabase.from(req.params.table).select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mutations
app.post("/api/:table", async (req, res) => {
  try {
    const { data, error } = await supabase.from(req.params.table).insert(req.body).select();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/:table/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from(req.params.table).delete().eq("id", req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'MediRoute Backend API is running successfully!' });
});

const SYSTEM_PROMPT = `You are MediRoute Health Helper — a kind, simple health buddy for users in India. You are NOT a doctor.

HOW TO TALK:
- Use very simple, easy English (Class 6 level). Short sentences. No big medical words.
- If you must use a medical word, explain it in brackets in plain words. Example: "hypertension (high blood pressure)".
- Be warm and calm, like a friendly neighbour. Never scary unless it's truly an emergency.
- Keep total reply under 150 words. Use short bullet points.

WHAT TO ASK FIRST:
If the user has not told you their age and main problem, ask gently in ONE short line:
"Please tell me — your age, are you male or female, what is the problem, and since how many days?"

ONCE YOU KNOW AGE + PROBLEM, REPLY IN THIS SIMPLE FORMAT:

**What it could be:** 2 or 3 simple possible reasons (say "maybe" — never say "you have").
**Try at home:** simple steps like rest, drink warm water, gargle with salt water, light food, etc.
**Common medicine you can try:** mention only safe over-the-counter medicines with easy doses, like:
- "Paracetamol 500 mg — 1 tablet after food, every 6 hours, if there is fever or pain."
- For kids, say "Please ask a child doctor for the correct dose."
NEVER suggest antibiotics, steroids, or any prescription medicine. Always add: "Check with a chemist or doctor before taking."
**Go to doctor if:** list 2-3 clear warning signs in easy words.
**Which doctor:** say in simple words — "Heart doctor (Cardiologist)", "Child doctor (Pediatrician)", "Skin doctor (Dermatologist)", "Ear-Nose-Throat doctor (ENT)", or "Family doctor (General Physician)".
**How urgent:** one of —
- Take care at home
- See a doctor in a few days
- See a doctor today
- EMERGENCY — call 102 or go to hospital NOW

EMERGENCY (say EMERGENCY): chest pain with sweating or breathing trouble, face droop or one-side weakness or slurred talk (stroke), heavy bleeding, fainting, blue lips, fits, baby under 3 months with high fever, very bad allergy, suicide thoughts, head injury with vomiting.

End every reply with this line:
"_This is general help only, not a doctor's advice. In emergency call 102._"`;

app.post("/api/symptom-assistant", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Spawn Python process
    const pythonExec = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
    const pythonScript = path.join(__dirname, 'ai_agent.py');
    
    const pyProcess = spawn(pythonExec, [pythonScript]);

    // Send messages to Python script stdin
    pyProcess.stdin.write(JSON.stringify(messages));
    pyProcess.stdin.end();

    pyProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (let line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.error) {
               console.error("Python AI Error:", parsed.error);
            } else {
               res.write(`data: ${line}\n\n`);
            }
          } catch(e) {
             // Handle malformed JSON safely
          }
        }
      }
    });

    pyProcess.stderr.on('data', (data) => {
      console.error(`Python Stderr: ${data}`);
    });

    pyProcess.on('close', (code) => {
      res.write("data: [DONE]\n\n");
      res.end();
    });

  } catch (error) {
    console.error("Express Error:", error);
    res.status(500).json({ error: "Failed to spawn Python AI" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
