const express = require("express");
const {
  upload,
  uploadResume,
  getResumeAnalysis,
  getUserResumes,
  deleteResume,
} = require("../controllers/resumeController");

const router = express.Router();

// Upload resume for analysis
router.post("/upload", upload.single("resume"), uploadResume);

// Get specific resume analysis
router.get("/:resumeId/analysis", getResumeAnalysis);

// Get user's resume history
router.get("/history", getUserResumes);

// Delete resume
router.delete("/:resumeId", deleteResume);

module.exports = router;
