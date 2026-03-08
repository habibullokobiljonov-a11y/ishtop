const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let jobs = [
  { id: 1, title: "Frontend Developer", company: "IT Solutions", location: "Toshkent", type: "Full-time" },
  { id: 2, title: "Backend Developer", company: "Tech Group", location: "Samarkand", type: "Remote" }
];

app.get("/jobs", (req, res) => {
  res.json(jobs);
});

app.post("/jobs", (req, res) => {
  const { title, company, location, type } = req.body;
  if (!title || !company || !location) {
    return res.status(400).json({ success: false, message: "Title, company, and location are required" });
  }
  const newJob = { id: Date.now(), title, company, location, type: type || "Full-time" };
  jobs.push(newJob);
  res.status(201).json({ success: true, data: newJob });
});

app.delete("/jobs/:id", (req, res) => {
  const jobId = Number(req.params.id);
  jobs = jobs.filter(job => job.id !== jobId);
  res.json({ success: true, message: "Job deleted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});