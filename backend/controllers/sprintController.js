const crypto = require("crypto");
const Sprint = require("../models/Sprint");
const Certificate = require("../models/Certificate");
const User = require("../models/User");

// ── Helper: SHA-256 certificate hash ──
const generateCertificateHash = (sprintId, professionalId, completionDate) => {
  const data = `${sprintId}-${professionalId}-${completionDate.toISOString()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};

// ── AI Match Engine ──
// Compares professional's skills with sprint's requiredSkills
const getMatchScore = (proSkills, sprintSkills) => {
  if (!proSkills || !sprintSkills || sprintSkills.length === 0) return 0;
  const proSet = proSkills.map(s => s.toLowerCase().trim());
  const sprintSet = sprintSkills.map(s => s.toLowerCase().trim());
  const matched = sprintSet.filter(s => proSet.some(ps => ps.includes(s) || s.includes(ps)));
  return Math.round((matched.length / sprintSet.length) * 100);
};

// ──────────────────────────────────────────
// @route   POST /api/sprints
// @desc    NGO creates a new sprint (status → POSTED)
// @access  Private / NGO
// ──────────────────────────────────────────
const createSprint = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, timeCommitment, ngoName } = req.body;

    // Micro-task constraint enforced at controller level too
    if (timeCommitment < 2 || timeCommitment > 5) {
      return res
        .status(400)
        .json({ message: "Time commitment must be between 2 and 5 hours" });
    }

    const sprint = await Sprint.create({
      title,
      description,
      category,
      requiredSkills: requiredSkills || [],
      timeCommitment,
      ngoName: ngoName || req.user.organization || req.user.name,
      budget: 0,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, sprint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints
// @desc    List sprints (filtered by role)
//          - NGO  → only their posted sprints
//          - Pro  → all POSTED sprints + their assigned
//          - Admin → everything
// @access  Private
// ──────────────────────────────────────────
const getSprints = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "NGO") {
      // NGO sees only their own sprints
      filter = { postedBy: req.user._id };
    } else if (req.user.role === "Professional") {
      // Professional sees open sprints + ones assigned to them
      filter = {
        $or: [{ status: "POSTED" }, { assignedTo: req.user._id }],
      };
    }
    // Orchestrator: no filter — sees all

    const sprints = await Sprint.find(filter)
      .populate("postedBy", "name email organization")
      .populate("assignedTo", "name email skills profession")
      .sort({ createdAt: -1 });

    // If Professional, attach match scores
    if (req.user.role === "Professional" && req.user.skills) {
      const sprintsWithScores = sprints.map(sp => {
        const obj = sp.toObject();
        obj.matchScore = getMatchScore(req.user.skills, sp.requiredSkills);
        return obj;
      });
      // Sort by match score for POSTED sprints
      sprintsWithScores.sort((a, b) => {
        if (a.status === "POSTED" && b.status === "POSTED") return b.matchScore - a.matchScore;
        return 0;
      });
      return res.status(200).json({ success: true, count: sprintsWithScores.length, sprints: sprintsWithScores });
    }

    res.status(200).json({ success: true, count: sprints.length, sprints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/ai-recommendations
// @desc    Professional: get sprints ranked by AI match
// @access  Private / Professional
// ──────────────────────────────────────────
const getAIRecommendations = async (req, res) => {
  try {
    const sprints = await Sprint.find({ status: "POSTED" })
      .populate("postedBy", "name email organization")
      .sort({ createdAt: -1 });

    const proSkills = req.user.skills || [];
    const recommendations = sprints.map(sp => {
      const obj = sp.toObject();
      obj.matchScore = getMatchScore(proSkills, sp.requiredSkills);
      return obj;
    });
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, count: recommendations.length, sprints: recommendations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/:id
// @desc    Get single sprint
// @access  Private
// ──────────────────────────────────────────
const getSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate("postedBy", "name email organization")
      .populate("assignedTo", "name email skills profession");

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    res.status(200).json({ success: true, sprint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/accept
// @desc    Professional accepts a POSTED sprint
//          POSTED → IN_PROGRESS
// @access  Private / Professional
// ──────────────────────────────────────────
const acceptSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "POSTED") {
      return res.status(400).json({ message: "Sprint is no longer available" });
    }

    sprint.status = "IN_PROGRESS";
    sprint.assignedTo = req.user._id;
    sprint.startedAt = new Date();
    await sprint.save();

    const populated = await Sprint.findById(sprint._id)
      .populate("postedBy", "name email organization")
      .populate("assignedTo", "name email skills profession");

    res.status(200).json({ success: true, sprint: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/submit
// @desc    Professional submits deliverable
//          IN_PROGRESS → PENDING_APPROVAL
// @access  Private / Professional
// ──────────────────────────────────────────
const submitSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Sprint is not in progress" });
    }

    if (String(sprint.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your assigned sprint" });
    }

    sprint.status = "PENDING_APPROVAL";
    sprint.submissionNote = req.body.submissionNote || "";
    sprint.submissionUrl = req.body.submissionUrl || "";
    sprint.submittedAt = new Date();
    await sprint.save();

    res.status(200).json({ success: true, sprint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/verify-impact
// @desc    NGO signs off → COMPLETED + certificate
//          PENDING_APPROVAL → COMPLETED
// @access  Private / NGO (who posted it)
// ──────────────────────────────────────────
const verifyImpact = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate("assignedTo", "name email");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "PENDING_APPROVAL") {
      return res
        .status(400)
        .json({ message: "Sprint is not pending approval" });
    }

    // Only the NGO who posted the sprint can approve
    if (String(sprint.postedBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the posting NGO can verify impact" });
    }

    const completionDate = new Date();

    // 1. Mark COMPLETED
    sprint.status = "COMPLETED";
    sprint.completedAt = completionDate;
    await sprint.save();

    // 2. Generate cryptographic certificate
    const hash = generateCertificateHash(
      sprint._id,
      sprint.assignedTo._id,
      completionDate
    );

    const certificate = await Certificate.create({
      sprint: sprint._id,
      professional: sprint.assignedTo._id,
      ngo: req.user._id,
      hash,
      completionDate,
      taskName: sprint.title,
      professionalName: sprint.assignedTo.name,
    });

    res.status(200).json({
      success: true,
      message: "Impact Verified ✅",
      certificate: {
        _id:              certificate._id,
        hash:             certificate.hash,
        completionDate:   certificate.completionDate,
        taskName:         certificate.taskName,
        professionalName: certificate.professionalName,
        ngoName:          req.user.organization || req.user.name,
        skills:           sprint.requiredSkills || [],
        timeCommitment:   sprint.timeCommitment || 0,
      },
      sprint,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/disagree
// @desc    NGO disagrees — flag for revision
//          PENDING_APPROVAL → IN_PROGRESS
// @access  Private / NGO
// ──────────────────────────────────────────
const disagreeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "PENDING_APPROVAL") {
      return res.status(400).json({ message: "Sprint is not pending approval" });
    }

    if (String(sprint.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the posting NGO can flag for revision" });
    }

    sprint.status = "IN_PROGRESS";
    sprint.flaggedForRevision = true;
    sprint.revisionNote = req.body.revisionNote || "Needs revision";
    sprint.submittedAt = null;
    await sprint.save();

    res.status(200).json({ success: true, message: "Task flagged for revision", sprint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/stop
// @desc    Professional stops — unassign and reset to POSTED
//          IN_PROGRESS → POSTED (assignedTo cleared)
// @access  Private / Professional
// ──────────────────────────────────────────
const stopSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Sprint is not in progress" });
    }

    if (String(sprint.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your assigned sprint" });
    }

    // Calculate time logged before clearing
    let timeLoggedStr = '0 mins';
    if (sprint.startedAt) {
      const ms = Date.now() - new Date(sprint.startedAt).getTime();
      const mins = Math.floor(ms / 60000);
      timeLoggedStr = `${mins} min${mins !== 1 ? 's' : ''}`;
    }

    // Clear assignment — task becomes available again
    sprint.status = "POSTED";
    sprint.assignedTo = null;
    sprint.startedAt = null;
    await sprint.save();

    res.status(200).json({ success: true, message: "Sprint stopped and made available again", sprint, timeLogged: timeLoggedStr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/me
// @desc    Professional: list their certificates
// @access  Private / Professional
// ──────────────────────────────────────────
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ professional: req.user._id })
      .populate("sprint", "title description category timeCommitment")
      .populate("ngo", "name organization")
      .sort({ completionDate: -1 });

    res.status(200).json({ success: true, count: certs.length, certificates: certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/all
// @desc    Admin: list every certificate
// @access  Private / Orchestrator
// ──────────────────────────────────────────
const getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate("sprint", "title description category")
      .populate("professional", "name email")
      .populate("ngo", "name organization")
      .sort({ completionDate: -1 });

    res.status(200).json({ success: true, count: certs.length, certificates: certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/:id/pdf
// @desc    Download PDF certificate
// @access  Private
// ──────────────────────────────────────────
const downloadCertificatePDF = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate("sprint", "title description category timeCommitment")
      .populate("professional", "name email")
      .populate("ngo", "name organization");

    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    // Build PDF content using plain text layout (no external dependency)
    const date = new Date(cert.completionDate).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    // Simple PDF using raw PDF spec (no npm dependency needed)
    const taskName = cert.taskName || cert.sprint?.title || "Impact Sprint";
    const proName = cert.professionalName || cert.professional?.name || "Professional";
    const ngoName = cert.ngo?.organization || cert.ngo?.name || "NGO";
    const hashShort = cert.hash.substring(0, 16).toUpperCase();

    const pdfContent = buildPDF(taskName, proName, ngoName, date, cert.hash, hashShort);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=ImpactSprint-Certificate-${hashShort}.pdf`);
    res.send(pdfContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Minimal PDF builder (no external dependency) ──
function buildPDF(taskName, proName, ngoName, date, hash, hashShort) {
  const lines = [
    "",
    "═══════════════════════════════════════════════",
    "",
    "       IMPACTSPRINT IMPACT CERTIFICATE",
    "",
    "═══════════════════════════════════════════════",
    "",
    `  Certificate ID: IS-${hashShort}`,
    "",
    `  This certifies that`,
    "",
    `       ${proName}`,
    "",
    `  has successfully completed the impact sprint:`,
    "",
    `       "${taskName}"`,
    "",
    `  for ${ngoName}`,
    "",
    `  Date of Completion: ${date}`,
    "",
    "─────────────────────────────────────────────",
    "",
    "  Verification Hash (SHA-256):",
    `  ${hash}`,
    "",
    "─────────────────────────────────────────────",
    "",
    "  Cryptographically signed & verified on the",
    "  ImpactSprint ledger.",
    "",
    "  © 2026 ImpactSprint. Built for the planet.",
    "",
    "═══════════════════════════════════════════════",
  ];

  const textBlock = lines.join("\n");
  const textLen = Buffer.byteLength(textBlock, "latin1");

  // Build raw PDF manually
  const stream = `BT\n/F1 11 Tf\n50 750 Td\n14 TL\n`;
  const textLines = lines.map(l => `(${l.replace(/[()\\]/g, "\\$&")}) '`).join("\n");
  const streamContent = stream + textLines + "\nET";
  const streamLen = Buffer.byteLength(streamContent);

  const pdf = [
    "%PDF-1.4",
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`,
    `4 0 obj<</Length ${streamLen}>>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Courier>>endobj`,
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "trailer<</Size 6/Root 1 0 R>>",
    "startxref",
    "0",
    "%%EOF",
  ].join("\n");

  return Buffer.from(pdf, "latin1");
}

// ──────────────────────────────────────────
// @route   GET /api/sprints/admin/feed
// @desc    Admin: get activity feed
// @access  Private / Orchestrator
// ──────────────────────────────────────────
const getAdminFeed = async (req, res) => {
  try {
    // Recent sprints (NGO activity)
    const recentSprints = await Sprint.find()
      .populate("postedBy", "name organization")
      .populate("assignedTo", "name skills profession")
      .sort({ updatedAt: -1 })
      .limit(20);

    // Recent users
    const recentUsers = await User.find({ role: { $ne: "Orchestrator" } })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent certificates
    const recentCerts = await Certificate.find()
      .populate("sprint", "title")
      .populate("professional", "name")
      .populate("ngo", "name organization")
      .sort({ createdAt: -1 })
      .limit(10);

    // Aggregate stats
    const totalSprints = await Sprint.countDocuments();
    const activeSprints = await Sprint.countDocuments({ status: { $in: ["POSTED", "IN_PROGRESS"] } });
    const completedSprints = await Sprint.countDocuments({ status: "COMPLETED" });
    const totalPros = await User.countDocuments({ role: "Professional" });
    const totalNGOs = await User.countDocuments({ role: "NGO" });
    const totalCerts = await Certificate.countDocuments();

    // Build activity feed items
    const feed = [];

    recentSprints.forEach(sp => {
      if (sp.status === "COMPLETED" && sp.assignedTo) {
        feed.push({
          type: "completed", dot: "var(--sage)",
          text: `${sp.postedBy?.organization || sp.postedBy?.name} approved "${sp.title}" by ${sp.assignedTo?.name}`,
          time: sp.completedAt || sp.updatedAt,
        });
      } else if (sp.status === "PENDING_APPROVAL" && sp.assignedTo) {
        feed.push({
          type: "review", dot: "var(--amber)",
          text: `${sp.assignedTo?.name} submitted "${sp.title}" — awaiting NGO review`,
          time: sp.submittedAt || sp.updatedAt,
        });
      } else if (sp.status === "IN_PROGRESS" && sp.assignedTo) {
        feed.push({
          type: "joined", dot: "var(--sky)",
          text: `${sp.assignedTo?.name} joined sprint "${sp.title}"`,
          time: sp.startedAt || sp.updatedAt,
        });
      } else if (sp.status === "POSTED") {
        feed.push({
          type: "posted", dot: "var(--amber)",
          text: `New sprint posted: "${sp.title}" by ${sp.postedBy?.organization || sp.postedBy?.name}`,
          time: sp.createdAt,
        });
      }
    });

    recentUsers.forEach(u => {
      feed.push({
        type: "registration", dot: "var(--amber)",
        text: `New ${u.role} registration: ${u.name}${u.organization ? ` (${u.organization})` : ""}`,
        time: u.createdAt,
      });
    });

    // Sort feed by time descending
    feed.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Format times
    const formatTime = (d) => {
      const diff = Date.now() - new Date(d).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
      const days = Math.floor(hrs / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    const formattedFeed = feed.slice(0, 15).map(f => ({
      ...f,
      time: formatTime(f.time),
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalSprints,
        activeSprints,
        completedSprints,
        totalPros,
        totalNGOs,
        totalCerts,
        completionRate: totalSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0,
      },
      feed: formattedFeed,
      recentUsers,
      recentCerts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
