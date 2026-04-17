const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createSprint,
  getSprints,
  getSprint,
  getAIRecommendations,
  acceptSprint,
  submitSprint,
  verifyImpact,
  disagreeSprint,
  stopSprint,
  getMyCertificates,
  getAllCertificates,
  downloadCertificatePDF,
  getAdminFeed,
} = require("../controllers/sprintController");

// ── Admin feed ──
router.get("/admin/feed", protect, authorize("Orchestrator"), getAdminFeed);

// ── AI Recommendations ──
router.get("/ai-recommendations", protect, authorize("Professional"), getAIRecommendations);

// ── Certificates (must come before /:id to avoid route collision) ──
router.get("/certificates/me", protect, authorize("Professional"), getMyCertificates);
router.get("/certificates/all", protect, authorize("Orchestrator"), getAllCertificates);
router.get("/certificates/:id/pdf", protect, downloadCertificatePDF);

// ── CRUD ──
router.post("/", protect, authorize("NGO"), createSprint);
router.get("/", protect, getSprints);
router.get("/:id", protect, getSprint);

// ── Workflow transitions ──
router.put("/:id/accept", protect, authorize("Professional"), acceptSprint);
router.put("/:id/submit", protect, authorize("Professional"), submitSprint);
router.put("/:id/stop",   protect, authorize("Professional"), stopSprint);
router.put("/:id/verify-impact", protect, authorize("NGO"), verifyImpact);
router.put("/:id/disagree", protect, authorize("NGO"), disagreeSprint);

module.exports = router;
