const API_BASE = "http://localhost:5000";

const jobsContainer = document.getElementById("jobsContainer");
const jobsLoading = document.getElementById("jobsLoading");
const jobsError = document.getElementById("jobsError");
const jobsEmpty = document.getElementById("jobsEmpty");
const addJobForm = document.getElementById("addJobForm");
const formMessage = document.getElementById("formMessage");
const jobsSearchInput = document.getElementById("jobsSearchInput");

let allJobs = [];

// Header scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("scrolled", window.scrollY > 50);
});

// GET http://localhost:5000/jobs — vakansiyalarni olish
async function fetchJobs() {
  jobsLoading.style.display = "block";
  jobsError.style.display = "none";
  jobsEmpty.style.display = "none";
  jobsContainer.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error("Server xatosi");
    const data = await res.json();
    allJobs = data || [];
    applyJobsFilter();
  } catch (err) {
    console.error(err);
    jobsError.style.display = "block";
  } finally {
    jobsLoading.style.display = "none";
  }
}

// Qidiruv bo'yicha filtr (title yoki company)
function applyJobsFilter() {
  jobsContainer.innerHTML = "";

  if (!allJobs.length) {
    jobsEmpty.style.display = "block";
    return;
  }

  const query = (jobsSearchInput?.value || "").trim().toLowerCase();

  const filtered = !query
    ? allJobs
    : allJobs.filter((job) => {
        const title = (job.title || "").toLowerCase();
        const company = (job.company || "").toLowerCase();
        return title.includes(query) || company.includes(query);
      });

  if (!filtered.length) {
    jobsEmpty.style.display = "block";
    return;
  }

  jobsEmpty.style.display = "none";
  renderJobs(filtered);
}

// Kartalar: title, company, location, type
function renderJobs(jobs) {
  jobsContainer.innerHTML = "";
  jobs.forEach((job, i) => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <h3 class="job-card-title">${escapeHtml(job.title)}</h3>
      <p class="job-card-company">Kompaniya: ${escapeHtml(job.company)}</p>
      <p class="job-card-location">Joylashuv: ${escapeHtml(job.location)}</p>
      <p class="job-card-type">Ish turi: ${escapeHtml(job.type || "Full-time")}</p>
      <button class="job-card-delete" data-id="${job.id}">Delete</button>
    `;
    jobsContainer.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// Vakansiyani o'chirish — DELETE /jobs/:id
async function deleteJob(id) {
  const confirmed = window.confirm("Bu vakansiyani o'chirishni istaysizmi?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success !== true) {
      throw new Error(data.message || "O'chirishda xatolik yuz berdi");
    }

    // Lokal massivdan ham o'chiramiz va ro'yxatni yangilaymiz
    allJobs = allJobs.filter((job) => job.id !== id);
    applyJobsFilter();
  } catch (err) {
    console.error(err);
    alert("Vakansiyani o'chirishda xatolik yuz berdi.");
  }
}

// Vakansiya qo'shish — POST /jobs orqali PostgreSQL ga saqlash
addJobForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "form-message";

  const fd = new FormData(addJobForm);
  const title = (fd.get("title") || "").trim();
  const company = (fd.get("company") || "").trim();
  const location = (fd.get("location") || "").trim();
  const type = (fd.get("type") || "Full-time").trim();

  if (!title || !company || !location) {
    formMessage.textContent = "Lavozim, kompaniya va joylashuv majburiy.";
    formMessage.className = "form-message error";
    return;
  }

  const body = { title, company, location, type: type || "Full-time" };

  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      formMessage.textContent = data.message || "Xatolik yuz berdi";
      formMessage.className = "form-message error";
      return;
    }

    formMessage.textContent = "Vakansiya muvaffaqiyatli qo'shildi! Ro'yxat yangilandi.";
    formMessage.className = "form-message success";
    addJobForm.reset();
    fetchJobs(); // Ro'yxatni yangilash
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Serverga ulanishda xatolik. Backend (5000-port) ishlayotganini tekshiring.";
    formMessage.className = "form-message error";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetchJobs();

  if (jobsSearchInput) {
    jobsSearchInput.addEventListener("input", applyJobsFilter);
  }

   // Delete tugmasi uchun event delegation
   if (jobsContainer) {
     jobsContainer.addEventListener("click", (e) => {
       const btn = e.target.closest(".job-card-delete");
       if (!btn) return;
       const id = Number(btn.dataset.id);
       if (!id) return;
       deleteJob(id);
     });
   }
});
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let jobs = [
 { id:1, title:"Frontend Developer", company:"IT Solutions", location:"Toshkent", type:"Full-time"},
 { id:2, title:"Backend Developer", company:"Tech Group", location:"Samarqand", type:"Remote"}
];

app.get("/jobs",(req,res)=>{
 res.json(jobs);
});

app.post("/jobs",(req,res)=>{
 const job = { id:Date.now(), ...req.body };
 jobs.push(job);
 res.json(job);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
 console.log("Server running on port "+PORT);
});