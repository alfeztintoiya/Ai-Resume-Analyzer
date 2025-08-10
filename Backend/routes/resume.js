const express = require("express");
const {
  upload,
  uploadResume,
  getResumeAnalysis,
  getUserResumes,
  deleteResume,
  convertResumeToImage,
} = require("../controllers/resumeController");

const router = express.Router();

// Upload resume for analysis
router.post("/upload", upload.single("resume"), uploadResume);

// Get specific resume analysis
router.get("/:resumeId/analysis", getResumeAnalysis);

// Get user's resume history
router.get("/history", getUserResumes);

//convert existing resume to image
router.post("/:resumeId/convert-image",convertResumeToImage);

// Delete resume
router.delete("/:resumeId", deleteResume);

module.exports = router;
