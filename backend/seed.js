require("dotenv").config();
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Hospital = require("./models/Hospital");
const Doctor = require("./models/Doctor");
const Department = require("./models/Department");
const Facility = require("./models/Facility");
const BloodBank = require("./models/BloodBank");
const Pharmacy = require("./models/Pharmacy");
const Scheme = require("./models/Scheme");
const EmergencyContact = require("./models/EmergencyContact");
const User = require("./models/User");

const seedData = async () => {
  const conn = await connectDB();
  if (!conn || mongoose.connection.readyState !== 1) {
    console.error("[Seed] Could not establish connection to MongoDB. Aborting seed.");
    process.exit(1);
  }

  console.log("[Seed] Clearing existing collections...");
  await Promise.all([
    Hospital.deleteMany({}),
    Doctor.deleteMany({}),
    Department.deleteMany({}),
    Facility.deleteMany({}),
    BloodBank.deleteMany({}),
    Pharmacy.deleteMany({}),
    Scheme.deleteMany({}),
    EmergencyContact.deleteMany({}),
  ]);

  console.log("[Seed] Inserting Admin user if not exists...");
  const adminEmail = "mediroutehealth@gmail.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      email: adminEmail,
      password: "AdminPassword123!",
      full_name: "MediRoute Admin",
      role: "admin",
      gender: "Other",
      dob: "1990-01-01",
    });
    await admin.save();
    console.log("[Seed] Admin user created (mediroutehealth@gmail.com / AdminPassword123!)");
  }

  console.log("[Seed] Inserting Hospitals...");
  const hospitals = await Hospital.insertMany([
    {
      name: "All India Institute of Medical Sciences (AIIMS)",
      city: "New Delhi",
      address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
      phone: "+91 11 2658 8500",
      lat: 28.5672,
      lng: 77.2100,
      specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics", "General Medicine"],
      rating: 4.9,
      cost_tier: "low",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: true,
      ayushman: true,
      image_url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 18,
        icu_total: 60,
        oxygen_available: 45,
        oxygen_total: 120,
        emergency_available: 12,
        emergency_total: 30,
        general_available: 110,
        general_total: 400,
      },
    },
    {
      name: "Apollo Hospitals, Bannerghatta",
      city: "Bengaluru",
      address: "154/11, Opp. IIM-B, Bannerghatta Road, Bengaluru - 560076",
      phone: "+91 80 2630 4050",
      lat: 12.8958,
      lng: 77.5989,
      specialties: ["Cardiology", "Neurology", "Orthopedics", "Gynaecology", "Oncology"],
      rating: 4.7,
      cost_tier: "high",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: false,
      ayushman: true,
      image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 8,
        icu_total: 40,
        oxygen_available: 24,
        oxygen_total: 80,
        emergency_available: 6,
        emergency_total: 20,
        general_available: 65,
        general_total: 250,
      },
    },
    {
      name: "Christian Medical College (CMC)",
      city: "Vellore",
      address: "Ida Scudder Road, Vellore, Tamil Nadu - 632004",
      phone: "+91 416 228 1000",
      lat: 12.9246,
      lng: 79.1348,
      specialties: ["General Medicine", "Cardiology", "Neurology", "Pediatrics", "Dermatology", "ENT"],
      rating: 4.8,
      cost_tier: "medium",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: false,
      ayushman: true,
      image_url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 14,
        icu_total: 50,
        oxygen_available: 38,
        oxygen_total: 100,
        emergency_available: 9,
        emergency_total: 25,
        general_available: 90,
        general_total: 350,
      },
    },
    {
      name: "Fortis Hospital, Mulund",
      city: "Mumbai",
      address: "Mulund Goregaon Link Road, Industrial Area, Mulund West, Mumbai - 400078",
      phone: "+91 22 4365 4365",
      lat: 19.1663,
      lng: 72.9362,
      specialties: ["Cardiology", "Orthopedics", "Neurology", "Oncology", "Dental"],
      rating: 4.6,
      cost_tier: "high",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: false,
      ayushman: false,
      image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 5,
        icu_total: 35,
        oxygen_available: 18,
        oxygen_total: 60,
        emergency_available: 4,
        emergency_total: 15,
        general_available: 42,
        general_total: 180,
      },
    },
    {
      name: "Manipal Hospital",
      city: "Bengaluru",
      address: "98, HAL Old Airport Rd, Kodihalli, Bengaluru - 560017",
      phone: "+91 80 2502 4444",
      lat: 12.9592,
      lng: 77.6496,
      specialties: ["Cardiology", "Pediatrics", "Oncology", "Orthopedics", "Gynaecology"],
      rating: 4.5,
      cost_tier: "medium",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: false,
      ayushman: true,
      image_url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 11,
        icu_total: 45,
        oxygen_available: 30,
        oxygen_total: 90,
        emergency_available: 8,
        emergency_total: 20,
        general_available: 78,
        general_total: 280,
      },
    },
    {
      name: "Kokilaben Dhirubhai Ambani Hospital",
      city: "Mumbai",
      address: "Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai - 400053",
      phone: "+91 22 4269 6969",
      lat: 19.1312,
      lng: 72.8258,
      specialties: ["Neurology", "Cardiology", "Oncology", "Orthopedics", "Pediatrics", "Dermatology"],
      rating: 4.8,
      cost_tier: "high",
      emergency_24x7: true,
      has_icu: true,
      has_mri: true,
      has_ambulance: true,
      is_government: false,
      ayushman: false,
      image_url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60",
      beds: {
        icu_available: 7,
        icu_total: 50,
        oxygen_available: 22,
        oxygen_total: 75,
        emergency_available: 5,
        emergency_total: 20,
        general_available: 55,
        general_total: 220,
      },
    },
  ]);

  console.log(`[Seed] Created ${hospitals.length} hospitals.`);

  const aiims = hospitals[0];
  const apollo = hospitals[1];
  const cmc = hospitals[2];
  const fortis = hospitals[3];

  console.log("[Seed] Inserting Doctors...");
  await Doctor.insertMany([
    {
      name: "Ramesh Sharma",
      specialization: "Cardiology",
      hospital_id: aiims._id,
      experience_years: 18,
      consultation_fee: 100,
      rating: 4.9,
      timing: "9:00 AM - 1:00 PM",
      available_days: ["Mon", "Wed", "Fri"],
      avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=60",
    },
    {
      name: "Priya Venkatesh",
      specialization: "Neurology",
      hospital_id: aiims._id,
      experience_years: 14,
      consultation_fee: 100,
      rating: 4.8,
      timing: "10:00 AM - 2:00 PM",
      available_days: ["Tue", "Thu", "Sat"],
      avatar_url: "https://images.unsplash.com/photo-1594824813501-48c9735d4695?w=300&auto=format&fit=crop&q=60",
    },
    {
      name: "Anil Kumar",
      specialization: "Orthopedics",
      hospital_id: apollo._id,
      experience_years: 12,
      consultation_fee: 800,
      rating: 4.7,
      timing: "11:00 AM - 4:00 PM",
      available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      avatar_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=60",
    },
    {
      name: "Sunita Menon",
      specialization: "Pediatrics",
      hospital_id: cmc._id,
      experience_years: 16,
      consultation_fee: 400,
      rating: 4.9,
      timing: "9:00 AM - 3:00 PM",
      available_days: ["Mon", "Wed", "Fri", "Sat"],
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=60",
    },
    {
      name: "Vikram Mehta",
      specialization: "Cardiology",
      hospital_id: fortis._id,
      experience_years: 20,
      consultation_fee: 1200,
      rating: 4.8,
      timing: "2:00 PM - 7:00 PM",
      available_days: ["Tue", "Thu", "Sat"],
      avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=60",
    },
  ]);

  console.log("[Seed] Inserting Departments...");
  await Department.insertMany([
    {
      name: "Cardiology & Cardiac Surgery",
      hospital_id: aiims._id,
      head_doctor: "Dr. Ramesh Sharma",
      phone: "+91 11 2659 4801",
      description: "Advanced cardiac care unit with 24x7 Cath Lab and coronary care.",
    },
    {
      name: "Neurology & Neurosurgery",
      hospital_id: aiims._id,
      head_doctor: "Dr. Priya Venkatesh",
      phone: "+91 11 2659 4802",
      description: "Comprehensive stroke unit, epilepsy center, and brain injury rehabilitation.",
    },
    {
      name: "Orthopedics & Joint Replacement",
      hospital_id: apollo._id,
      head_doctor: "Dr. Anil Kumar",
      phone: "+91 80 2630 4088",
      description: "Robotic joint replacement and sports medicine wing.",
    },
  ]);

  console.log("[Seed] Inserting Facilities...");
  await Facility.insertMany([
    {
      name: "24x7 Cardiac Emergency & Cath Lab",
      hospital_id: aiims._id,
      category: "emergency",
      available: true,
      notes: "Direct triage access from Gate 2.",
    },
    {
      name: "3T High Resolution MRI Unit",
      hospital_id: apollo._id,
      category: "diagnostics",
      available: true,
      notes: "Located on basement floor B-1.",
    },
    {
      name: "Pediatric Intensive Care Unit (PICU)",
      hospital_id: cmc._id,
      category: "critical_care",
      available: true,
      notes: "15-bed advanced level 3 PICU.",
    },
  ]);

  console.log("[Seed] Inserting Blood Banks...");
  await BloodBank.insertMany([
    {
      name: "Indian Red Cross Society Blood Bank",
      city: "New Delhi",
      address: "1, Red Cross Road, Near Parliament Street, New Delhi - 110001",
      phone: "+91 11 2371 1551",
      available_groups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    {
      name: "Lions Club Blood Bank",
      city: "Mumbai",
      address: "Plot 37, Sector 15, Vashi, Navi Mumbai - 400703",
      phone: "+91 22 2789 2200",
      available_groups: ["A+", "B+", "O+", "AB+"],
    },
    {
      name: "Rotary TTK Blood Bank",
      city: "Bengaluru",
      address: "New Thippasandra Main Road, HAL 3rd Stage, Bengaluru - 560075",
      phone: "+91 80 2528 7903",
      available_groups: ["A+", "A-", "B+", "O+", "O-"],
    },
  ]);

  console.log("[Seed] Inserting Pharmacies...");
  await Pharmacy.insertMany([
    {
      name: "Apollo Pharmacy - 24/7 Central",
      city: "New Delhi",
      address: "Shop 12, AIIMS Metro Station Complex, New Delhi",
      phone: "+91 11 2658 9911",
      open_24x7: true,
      home_delivery: true,
      medicines: ["Paracetamol", "Azithromycin", "Insulin", "Amoxicillin", "Metformin", "Amlodipine", "Pantoprazole"],
    },
    {
      name: "MedPlus 24 Hours",
      city: "Bengaluru",
      address: "45/2, 80 Feet Road, 4th Block, Koramangala, Bengaluru",
      phone: "+91 80 2553 4411",
      open_24x7: true,
      home_delivery: true,
      medicines: ["Paracetamol", "Cetirizine", "Ibuprofen", "Atorvastatin", "Losartan", "Omeprazole"],
    },
    {
      name: "Wellness Forever 24x7",
      city: "Mumbai",
      address: "Ground Floor, Hill Road, Bandra West, Mumbai",
      phone: "+91 22 2640 5500",
      open_24x7: true,
      home_delivery: true,
      medicines: ["Paracetamol", "Dolo 650", "Augmentin", "Telmisartan", "Glycomet", "Pan-D"],
    },
  ]);

  console.log("[Seed] Inserting Government Schemes...");
  await Scheme.insertMany([
    {
      name: "Ayushman Bharat - PM-JAY",
      description: "World's largest health assurance scheme providing ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
      eligibility: "Deprived rural families and identified occupational categories of urban workers based on SECC 2011.",
      benefits: "Cashless coverage of up to ₹5,00,000 per family per year across empaneled public and private hospitals.",
      link: "https://pmjay.gov.in",
    },
    {
      name: "Central Government Health Scheme (CGHS)",
      description: "Comprehensive medical care facilities for Central Government employees, pensioners, and their dependents.",
      eligibility: "Serving and retired Central Govt employees and accredited journalists.",
      benefits: "OPD and IPD facilities, specialist consultations, and reimbursement of emergency treatments.",
      link: "https://cghs.nic.in",
    },
    {
      name: "Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)",
      description: "Aimed at correcting regional imbalances in the availability of affordable and reliable tertiary healthcare services.",
      eligibility: "Open to all Indian citizens at established AIIMS-like apex medical institutes.",
      benefits: "Super-specialty healthcare and medical education access at government rates.",
      link: "https://pmssy.mohfw.gov.in",
    },
  ]);

  console.log("[Seed] Inserting Emergency Contacts...");
  await EmergencyContact.insertMany([
    { label: "National Emergency Number", number: "112", category: "all-in-one" },
    { label: "Ambulance Helpline", number: "102", category: "medical" },
    { label: "Emergency Disaster Management", number: "108", category: "medical" },
    { label: "Police Control Room", number: "100", category: "police" },
    { label: "Fire & Rescue", number: "101", category: "fire" },
    { label: "Women in Distress Helpline", number: "1091", category: "women" },
    { label: "Child Helpline", number: "1098", category: "child" },
  ]);

  console.log("[Seed] Database seed completed successfully!");
  process.exit(0);
};

seedData().catch((err) => {
  console.error("[Seed] Error seeding database:", err);
  process.exit(1);
});
