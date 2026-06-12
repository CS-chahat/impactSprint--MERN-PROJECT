const crypto = require("crypto");
const Sprint = require("../models/Sprint");
const Certificate = require("../models/Certificate");
const User = require("../models/User");

// ──────────────────────────────────────────
// @route   POST /api/sprints
// @desc    Create a sprint
// @access  NGO
// ──────────────────────────────────────────
const createSprint = async (req, res) => {
    try {
        const { title, description, timeCommitment, requiredSkills, category, ngoName, budget } = req.body;

        const sprint = await Sprint.create({
            title,
            description,
            timeCommitment,
            requiredSkills: requiredSkills || [],
            category: category || "Other",
            ngoName: ngoName || req.user.organization || req.user.name,
            budget: budget || 0,
            postedBy: req.user._id,
            status: "POSTED"
        });

        res.status(201).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints
// @desc    Get sprints (Role-based logic)
// @access  Private
// ──────────────────────────────────────────
const getSprints = async (req, res) => {
    try {
        let query = {};
        const { status } = req.query;
        if (status) query.status = status;

        if (req.user.role === "NGO") {
            query.postedBy = req.user._id;
        } else if (req.user.role === "Professional") {
            // Professionals see POSTED and their assigned sprints
            query = {
                $or: [
                    { status: "POSTED" },
                    { assignedTo: req.user._id }
                ]
            };
        }
        // Orchestrator sees all, so query remains what it was

        let sprints = await Sprint.find(query).populate("postedBy", "name organization avatar").populate("assignedTo", "name avatar profession").sort({ createdAt: -1 }).lean();

        // If professional, add a mock matchScore based on skills overlap
        if (req.user.role === "Professional" && req.user.skills && req.user.skills.length > 0) {
            const userSkillsLower = req.user.skills.map(s => s.toLowerCase());
            sprints = sprints.map(s => {
                if (s.status !== "POSTED" && String(s.assignedTo?._id) !== String(req.user._id)) return s;
                let score = 50; // base score
                if (s.requiredSkills && s.requiredSkills.length > 0) {
                    const reqSkillsLower = s.requiredSkills.map(sk => sk.toLowerCase());
                    const intersection = reqSkillsLower.filter(sk => userSkillsLower.includes(sk));
                    const matchPercent = (intersection.length / reqSkillsLower.length) * 100;
                    score = Math.min(100, Math.floor(score + (matchPercent * 0.5)));
                } else {
                    score = 75; // No specific skills required, decent match
                }
                return { ...s, matchScore: score };
            });
        }

        res.status(200).json({ success: true, count: sprints.length, sprints });
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
            .populate("postedBy", "name organization avatar")
            .populate("assignedTo", "name avatar profession");

        if (!sprint) {
            return res.status(404).json({ message: "Sprint not found" });
        }

        res.status(200).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/ai-recommendations
// @desc    Get top matches for pro
// @access  Professional
// ──────────────────────────────────────────
const getAIRecommendations = async (req, res) => {
    // Mostly obsolete if getSprints handles it, but implemented for completeness
    try {
        res.status(200).json({ success: true, recommendations: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/accept
// @desc    Professional accepts a sprint
// @access  Professional
// ──────────────────────────────────────────
const acceptSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) {
            return res.status(404).json({ message: "Sprint not found" });
        }
        if (sprint.status !== "POSTED" && !sprint.assignedTo) {
            return res.status(400).json({ message: "Sprint is no longer available" });
        }
        if (sprint.assignedTo && String(sprint.assignedTo) !== String(req.user._id)) {
             return res.status(400).json({ message: "Sprint is assigned to someone else" });
        }

        sprint.status = "IN_PROGRESS";
        sprint.assignedTo = req.user._id;
        sprint.startedAt = Date.now();
        await sprint.save();

        res.status(200).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/submit
// @desc    Professional submits work
// @access  Professional
// ──────────────────────────────────────────
const submitSprint = async (req, res) => {
    try {
        const { submissionNote, submissionUrl } = req.body;
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) return res.status(404).json({ message: "Sprint not found" });
        if (String(sprint.assignedTo) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to submit this sprint" });
        }
        if (sprint.status !== "IN_PROGRESS") {
            return res.status(400).json({ message: "Sprint is not in progress" });
        }

        sprint.status = "PENDING_APPROVAL";
        sprint.submissionNote = submissionNote || "";
        sprint.submissionUrl = submissionUrl || "";
        sprint.submittedAt = Date.now();
        sprint.flaggedForRevision = false;
        await sprint.save();

        res.status(200).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/verify-impact
// @desc    NGO approves work & generates certificate
// @access  NGO
// ──────────────────────────────────────────
const verifyImpact = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id).populate("assignedTo").populate("postedBy");
        
        if (!sprint) return res.status(404).json({ message: "Sprint not found" });
        if (String(sprint.postedBy._id) !== String(req.user._id) && req.user.role !== "Orchestrator") {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (sprint.status !== "PENDING_APPROVAL") {
            return res.status(400).json({ message: "Sprint is not pending approval" });
        }

        sprint.status = "COMPLETED";
        sprint.completedAt = Date.now();
        await sprint.save();

        // Cryptographic Hash for Verification
        const hashPayload = `${sprint._id}-${sprint.assignedTo._id}-${sprint.completedAt.getTime()}-${process.env.JWT_SECRET || 'secret'}`;
        const hash = crypto.createHash('sha256').update(hashPayload).digest('hex').substring(0, 16).toUpperCase();

        const certificate = await Certificate.create({
            sprint: sprint._id,
            professional: sprint.assignedTo._id,
            ngo: sprint.postedBy._id,
            hash,
            taskName: sprint.title,
            professionalName: sprint.assignedTo.name,
            completionDate: sprint.completedAt,
        });

        res.status(200).json({ success: true, sprint, certificate });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/disagree
// @desc    NGO returns work for revision
// @access  NGO
// ──────────────────────────────────────────
const disagreeSprint = async (req, res) => {
    try {
        const { revisionNote } = req.body;
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) return res.status(404).json({ message: "Sprint not found" });
        if (String(sprint.postedBy) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (sprint.status !== "PENDING_APPROVAL") {
            return res.status(400).json({ message: "Sprint is not pending approval" });
        }

        sprint.status = "IN_PROGRESS";
        sprint.flaggedForRevision = true;
        sprint.revisionNote = revisionNote || "Returned for revision by NGO.";
        await sprint.save();

        res.status(200).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   PUT /api/sprints/:id/stop
// @desc    Professional aborts the sprint
// @access  Professional
// ──────────────────────────────────────────
const stopSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) return res.status(404).json({ message: "Sprint not found" });
        if (String(sprint.assignedTo) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to stop this sprint" });
        }

        sprint.status = "POSTED";
        sprint.assignedTo = null;
        sprint.startedAt = null;
        sprint.submissionNote = "";
        sprint.submissionUrl = "";
        sprint.flaggedForRevision = false;
        await sprint.save();

        res.status(200).json({ success: true, sprint });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/me
// @desc    Get logged in user's certificates
// @access  Professional
// ──────────────────────────────────────────
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ professional: req.user._id })
            .populate("sprint")
            .populate("ngo", "name organization")
            .sort({ completionDate: -1 });
        
        res.status(200).json({ success: true, certificates });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/all
// @desc    Admin view all certificates
// @access  Orchestrator
// ──────────────────────────────────────────
const getAllCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find()
            .populate("professional", "name email")
            .populate("ngo", "name organization")
            .sort({ completionDate: -1 });
        res.status(200).json({ success: true, certificates });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/certificates/:id/pdf
// @desc    Get certificate data by ID
// @access  Private
// ──────────────────────────────────────────
const downloadCertificatePDF = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate("sprint")
            .populate("professional", "name email")
            .populate("ngo", "name organization avatar verification_url");
        
        if (!certificate) return res.status(404).json({ message: "Certificate not found" });

        res.status(200).json({ success: true, certificate });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   GET /api/sprints/admin/feed
// @desc    Basic dashboard feed for orchestrator
// @access  Orchestrator
// ──────────────────────────────────────────
const getAdminFeed = async (req, res) => {
    try {
        const [totalSprints, activeSprints, completedSprints, totalPros, totalNGOs, totalCerts, recentUsers] = await Promise.all([
            Sprint.countDocuments(),
            Sprint.countDocuments({ status: { $in: ["IN_PROGRESS", "PENDING_APPROVAL"] } }),
            Sprint.countDocuments({ status: "COMPLETED" }),
            User.countDocuments({ role: "Professional" }),
            User.countDocuments({ role: "NGO" }),
            Certificate.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(10).lean()
        ]);

        const completionRate = totalSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0;

        // Construct mock feed based on counts
        const feed = [];
        if (totalSprints > 0) feed.push({ dot: 'var(--sage)', text: 'New sprints have been posted to the platform.', time: 'Recently' });
        if (totalPros > 0) feed.push({ dot: 'var(--mint)', text: 'New professionals joined the platform.', time: 'Recently' });
        if (totalCerts > 0) feed.push({ dot: 'var(--sky)', text: 'Impact certificates have been successfully issued.', time: 'Recently' });
        if (totalNGOs > 0) feed.push({ dot: 'var(--amber)', text: 'New NGOs are awaiting verification or posting.', time: 'Recently' });
        if (feed.length === 0) {
            feed.push({ dot: 'var(--sage)', text: 'Platform initialized. Awaiting user activity.', time: 'Just now' });
        }

        res.status(200).json({ 
            success: true, 
            stats: {
                totalSprints,
                activeSprints,
                completedSprints,
                completionRate,
                totalPros,
                totalNGOs,
                totalCerts
            },
            feed,
            recentUsers
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
    getAdminFeed
};