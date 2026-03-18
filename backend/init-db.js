/**
 * PostgreSQL jobs jadvalini yaratish va demo ma'lumotlar.
 * Ishga tushirish: node init-db.js
 */
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createJobsTable = `
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'Full-time',
  salary VARCHAR(100) DEFAULT 'Kelishiladi',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const createResumesTable = `
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  profession VARCHAR(100) NOT NULL,
  experience VARCHAR(100) DEFAULT 'Keltirilmagan',
  contact VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const seedData = [
  { title: "Frontend Developer", company: "IT Solutions", location: "Toshkent", type: "Full-time" },
  { title: "Backend Developer", company: "Tech Group", location: "Samarqand", type: "Full-time" },
  { title: "Sotuv Menejeri", company: "Mega Trade", location: "Buxoro", type: "Full-time" },
];

async function init() {
  const client = await pool.connect();
  try {
    // Create jobs table
    await client.query(createJobsTable);
    console.log("✅ jobs jadvali yaratildi.");

    // Create resumes table
    await client.query(createResumesTable);
    console.log("✅ resumes jadvali yaratildi.");

    // Seed jobs
    const jobCount = await client.query("SELECT COUNT(*) FROM jobs");
    if (parseInt(jobCount.rows[0].count, 10) === 0) {
      for (const row of seedData) {
        await client.query(
          "INSERT INTO jobs (title, company, location, type) VALUES ($1, $2, $3, $4)",
          [row.title, row.company, row.location, row.type]
        );
      }
      console.log("✅ Demo vakansiyalar qo'shildi.");
    } else {
      console.log("ℹ️ Jobs jadvalida ma'lumotlar mavjud.");
    }

    // Seed resumes if empty
    const resumeCount = await client.query("SELECT COUNT(*) FROM resumes");
    if (parseInt(resumeCount.rows[0].count, 10) === 0) {
      const demoResumes = [
        { name: "Ali Valiyev", profession: "Frontend Developer", experience: "2 yil", contact: "@ali_dev" },
        { name: "Diyora Rustamova", profession: "UI/UX Designer", experience: "1 yil", contact: "+998901234567" }
      ];
      for (const resume of demoResumes) {
        await client.query(
          "INSERT INTO resumes (name, profession, experience, contact) VALUES ($1, $2, $3, $4)",
          [resume.name, resume.profession, resume.experience, resume.contact]
        );
      }
      console.log("✅ Demo rezumelar qo'shildi.");
    } else {
      console.log("ℹ️ Resumes jadvalida ma'lumotlar mavjud.");
    }
  } catch (err) {
    console.error("Xatolik:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
