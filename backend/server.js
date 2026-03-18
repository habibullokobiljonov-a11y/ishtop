const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Admin password from env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// ============ JOBS ENDPOINTS ============

// GET all jobs
app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Jobs fetch error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// GET single job
app.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Vakansiya topilmadi" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Job fetch error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// POST new job (admin only)
app.post("/jobs", async (req, res) => {
  const { title, company, location, type, salary, password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri!" });
  }

  if (!title || !company || !location) {
    return res.status(400).json({ success: false, message: "Title, company va location majburiy" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO jobs (title, company, location, type, salary) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, company, location, type || "Full-time", salary || "Kelishiladi"]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Job creation error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// DELETE job (admin only)
app.delete("/jobs/:id", async (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri!" });
  }

  try {
    const { id } = req.params;
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
    res.json({ success: true, message: "Vakansiya o'chirildi" });
  } catch (err) {
    console.error("Job deletion error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// ============ RESUMES ENDPOINTS ============

// GET all resumes
app.get("/resumes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM resumes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Resumes fetch error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// POST new resume
app.post("/resumes", async (req, res) => {
  const { name, profession, experience, contact } = req.body;

  // Validation
  if (!name || !profession || !contact) {
    return res.status(400).json({ success: false, message: "Ism, kasb va aloqa majburiy" });
  }

  if (name.length > 100 || profession.length > 100 || contact.length > 100) {
    return res.status(400).json({ success: false, message: "Ma'lumotlar juda uzun" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO resumes (name, profession, experience, contact) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, profession, experience || "Keltirilmagan", contact]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Resume creation error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// DELETE resume (admin only)
app.delete("/resumes/:id", async (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri!" });
  }

  try {
    const { id } = req.params;
    await pool.query("DELETE FROM resumes WHERE id = $1", [id]);
    res.json({ success: true, message: "Rezume o'chirildi" });
  } catch (err) {
    console.error("Resume deletion error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// ============ HEALTH CHECK ============

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server ishlamoqda" });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portida ishlamoqda`);
  console.log(`📡 Frontend: http://localhost:3000`);
  console.log(`🗄️  Database: Connected to PostgreSQL`);
});



