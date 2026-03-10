const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();

// Basic security middleware
app.use(helmet({ contentSecurityPolicy: false })); // allow local scripts

// Rate limiting (max 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Juda ko'p so'rov yuborildi. Iltimos, keyinroq urinib ko'ring." }
});
app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let jobs = [
  { id: 1, title: "Frontend Developer", company: "IT Solutions", location: "Toshkent", type: "Full-time" },
  { id: 2, title: "Backend Developer", company: "Tech Group", location: "Samarqand", type: "Remote" },
  { id: 3, title: "UI/UX Designer", company: "Creative Studio", location: "Toshkent", type: "Part-time" },
  { id: 4, title: "Project Manager", company: "SoftDev", location: "Farg'ona", type: "Full-time" },
  { id: 5, title: "System Administrator", company: "Bank System", location: "Buxoro", type: "Full-time" },
  { id: 6, title: "Data Analyst", company: "DataTech", location: "Toshkent", type: "Remote" },
  { id: 7, title: "HR Manager", company: "HR Consulting", location: "Andijon", type: "Full-time" },
  { id: 8, title: "DevOps Engineer", company: "Cloud Services", location: "Toshkent", type: "Remote" }
];

app.get("/jobs", (req, res) => {
  res.json(jobs);
});

// RESUMES ENDPOINTS
let resumes = [
  { id: 1, name: "Ali Valiyev", profession: "Frontend Developer", experience: "2 yil", contact: "@ali_dev" },
  { id: 2, name: "Diyora Rustamova", profession: "UI/UX Designer", experience: "1 yil", contact: "+998901234567" }
];

app.get("/resumes", (req, res) => {
  res.json(resumes);
});

app.post("/resumes", (req, res) => {
  const { name, profession, experience, contact } = req.body;
  if (!name || !profession || !contact) {
    return res.status(400).json({ success: false, message: "Ism, kasb va aloqa ma'lumotlari majburiy." });
  }

  // Basic validation (prevent extreme lengths)
  if (name.length > 50 || profession.length > 50 || contact.length > 50) {
    return res.status(400).json({ success: false, message: "Kiritilgan ma'lumotlar juda uzun." });
  }

  const newResume = { id: Date.now(), name, profession, experience: experience || "Keltirilmagan", contact };
  resumes.push(newResume);
  res.status(201).json({ success: true, data: newResume });
});

app.delete("/resumes/:id", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri! Faqat adminlar o'chira oladi." });
  }

  const resumeId = Number(req.params.id);
  resumes = resumes.filter(r => r.id !== resumeId);
  res.json({ success: true });
});

const ADMIN_PASSWORD = "admin";

app.post("/jobs", (req, res) => {
  const { title, company, location, type, salary, password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri! Faqat adminlar vakansiya qo'sha oladi." });
  }

  if (!title || !company || !location) {
    return res.status(400).json({ success: false, message: "Required fields" });
  }
  const newJob = { id: Date.now(), title, company, location, type: type || "Full-time", salary: salary || "Kelishiladi" };
  jobs.push(newJob);
  res.status(201).json({ success: true, data: newJob });
});

app.delete("/jobs/:id", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri! Faqat adminlar o'chira oladi." });
  }

  const jobId = Number(req.params.id);
  jobs = jobs.filter(job => job.id !== jobId);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});