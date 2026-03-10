const API_BASE = window.location.origin;

const jobsContainer = document.getElementById("jobsContainer");
const jobsLoading = document.getElementById("jobsLoading");
const jobsError = document.getElementById("jobsError");
const jobsEmpty = document.getElementById("jobsEmpty");
const addJobForm = document.getElementById("addJobForm");
const formMessage = document.getElementById("formMessage");
const jobsSearchInput = document.getElementById("jobsSearchInput");

// Resume elements
const resumesContainer = document.getElementById("resumesContainer");
const resumesLoading = document.getElementById("resumesLoading");
const resumesEmpty = document.getElementById("resumesEmpty");
const addResumeForm = document.getElementById("addResumeForm");
const resumeFormMessage = document.getElementById("resumeFormMessage");

let allJobs = [];
let allResumes = [];
// Header scroll
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    header.classList.toggle("scrolled", window.scrollY > 50);
});
// GET http://localhost:5000/jobs
async function fetchJobs() {
    jobsLoading.style.display = "block";
    jobsError.style.display = "none";
    jobsEmpty.style.display = "none";
    jobsContainer.innerHTML = "";
    try {
        const res = await fetch(`${API_BASE}/jobs`);
        if (!res.ok) throw new Error("Server error");
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
// Search filter function
function applyJobsFilter() {
    jobsContainer.innerHTML = "";
    if (!allJobs.length) {
        jobsEmpty.style.display = "block";
        return;
    }
    const query = (jobsSearchInput?.value || "").trim().toLowerCase();
    const filtered = !query ? allJobs : allJobs.filter((job) => {
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
// Render jobs function
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
            <p class="job-card-salary">Maosh: ${escapeHtml(job.salary || "Kelishiladi")}</p>
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
// Delete job
async function deleteJob(id) {
    const password = prompt("Vakansiyani o'chirish uchun admin parolini kiriting:");
    if (!password) return;
    const confirmed = window.confirm("Rostdan ham bu vakansiyani o'chirasizmi?");
    if (!confirmed) return;
    try {
        const res = await fetch(`${API_BASE}/jobs/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success !== true) {
            throw new Error(data.message || "Error deleting job");
        }
        allJobs = allJobs.filter((job) => job.id !== id);
        applyJobsFilter();
    } catch (err) {
        console.error(err);
        alert("Vakansiyani o'chirishda xatolik yuz berdi.");
    }
}
// Add job form submission
addJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "";
    formMessage.className = "form-message";
    const fd = new FormData(addJobForm);
    const title = (fd.get("title") || "").trim();
    const company = (fd.get("company") || "").trim();
    const location = (fd.get("location") || "").trim();
    const salary = (fd.get("salary") || "").trim() || "Kelishiladi";
    const type = (fd.get("type") || "").trim() || "Full-time";
    const password = (fd.get("password") || "").trim();

    if (!title || !company || !location || !password) {
        formMessage.textContent = "Barcha yulduzchali maydonlarni, shuningdek parolni to'ldirish majburiy.";
        formMessage.className = "form-message error";
        return;
    }
    const body = { title, company, location, type, salary, password };
    try {
        const res = await fetch(`${API_BASE}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
            formMessage.textContent = data.message || "Xatolik yuz berdi";
            formMessage.className = "form-message error";
            return;
        }
        formMessage.textContent = "Vakansiya muvaffaqiyatli qo'shildi!";
        formMessage.className = "form-message success";
        addJobForm.reset();
        fetchJobs();
    } catch (err) {
        console.error(err);
        formMessage.textContent = "Serverga ulanishda xatolik. Backend (5000-port) ishlayotganini tekshiring.";
        formMessage.className = "form-message error";
    }
});

// GET http://localhost:5000/resumes
async function fetchResumes() {
    if (!resumesLoading) return;
    resumesLoading.style.display = "block";
    resumesEmpty.style.display = "none";
    resumesContainer.innerHTML = "";
    try {
        const res = await fetch(`${API_BASE}/resumes`);
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        allResumes = data || [];
        renderResumes(allResumes);
    } catch (err) {
        console.error(err);
    } finally {
        resumesLoading.style.display = "none";
    }
}

// Render resumes function
function renderResumes(resumesList) {
    resumesContainer.innerHTML = "";
    if (!resumesList.length) {
        resumesEmpty.style.display = "block";
        return;
    }
    resumesEmpty.style.display = "none";
    resumesList.forEach((resume, i) => {
        const card = document.createElement("div");
        card.className = "job-card resume-card";
        card.style.animationDelay = `${i * 0.05}s`;
        card.style.borderLeft = "5px solid #16a34a"; // Green border to distinguish

        card.innerHTML = `
            <h3 class="job-card-title resume-name">${escapeHtml(resume.name)}</h3>
            <p class="job-card-company resume-profession"><b>Kasb:</b> ${escapeHtml(resume.profession)}</p>
            <p class="job-card-location resume-experience"><b>Tajriba:</b> ${escapeHtml(resume.experience || "Yo'q")}</p>
            <p class="job-card-type resume-contact"><b>Aloqa:</b> ${escapeHtml(resume.contact)}</p>
        `;
        resumesContainer.appendChild(card);
    });
}

// Add resume form submission
if (addResumeForm) {
    addResumeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        resumeFormMessage.textContent = "";
        resumeFormMessage.className = "form-message";
        const fd = new FormData(addResumeForm);

        const name = (fd.get("name") || "").trim();
        const profession = (fd.get("profession") || "").trim();
        const experience = (fd.get("experience") || "").trim();
        const contact = (fd.get("contact") || "").trim();

        if (!name || !profession || !contact) {
            resumeFormMessage.textContent = "Ism, Kasb va Aloqa maydonlari majburiy.";
            resumeFormMessage.className = "form-message error";
            return;
        }

        const body = { name, profession, experience, contact };

        try {
            const res = await fetch(`${API_BASE}/resumes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                resumeFormMessage.textContent = data.message || "Xatolik yuz berdi";
                resumeFormMessage.className = "form-message error";
                return;
            }
            resumeFormMessage.textContent = "Rezyume muvaffaqiyatli saqlandi!";
            resumeFormMessage.className = "form-message success";
            addResumeForm.reset();
            fetchResumes();
        } catch (err) {
            console.error(err);
            resumeFormMessage.textContent = "Serverga ulanishda xatolik.";
            resumeFormMessage.className = "form-message error";
        }
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchJobs();
    fetchResumes();
    if (jobsSearchInput) {
        jobsSearchInput.addEventListener("input", applyJobsFilter);
    }
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