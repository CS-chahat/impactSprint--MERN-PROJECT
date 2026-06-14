const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs'); // 👈 MAKE SURE THIS EXACT LINE IS HERE
// ── Fixed Admin Credentials ──
// Change lines 6 & 7 to this:
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@impactsprint.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@2026!#";
// Helper: generate JWT & set cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        sameSite: "lax",
    };

    res
        .status(statusCode)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                organization: user.organization,
                bio: user.bio,
                avatar: user.avatar,
                profession: user.profession,
            },
        });
};

// ──────────────────────────────────────────
// @desc    Seed / ensure fixed Admin exists
// @access  Called on server boot
// ──────────────────────────────────────────


const seedAdmin = async () => {
    try {
        console.log("⏳ SEED CHECK: Triggering script...");
        
        const emailToSeed = process.env.ADMIN_EMAIL || "admin@impactsprint.com";
        const passwordToSeed = process.env.ADMIN_PASSWORD || "Admin@2026!#";

        let admin = await Admin.findOne({ email: emailToSeed });
        
        if (!admin) {
            // 💡 FIX: Manually hash the password right here before saving!
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(passwordToSeed, salt);

            admin = await Admin.create({
                name: "ImpactSprint Admin",
                email: emailToSeed,
                password: encryptedPassword, // 👈 Pass the securely hashed string here!
                role: "Orchestrator",
                isVerified: true
            });
            console.log("🔑 SEED SUCCESS: Admin account generated inside database!");
        } else {
            console.log("ℹ️ SEED INFO: Admin already exists.");
        }
    } catch (err) {
        console.error("🔥 SEED CRASH:", err.message);
    }
};
// ──────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new NGO or Professional
// @access  Public
// ──────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, role, skills, organization, registrationId, mission, website, bio, linkedinUrl, profession, verification_url, github_url } = req.body;

        // Block attempts to register as Orchestrator
        if (role === "Orchestrator") {
            return res.status(403).json({ message: "Cannot register as Orchestrator" });
        }

        // Check duplicate
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "Professional",
            skills: skills || [],
            organization: organization || "",
            registrationId: registrationId || "",
            mission: mission || "",
            website: website || "",
            bio: bio || "",
            linkedinUrl: linkedinUrl || "",
            profession: profession || "",
            verification_url: verification_url || "",
            github_url: github_url || "",
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login (Admin, NGO, or Professional)
// @access  Public
// ──────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login (Admin, NGO, or Professional)
// @access  Public
// ──────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login (Admin, NGO, or Professional)
// @access  Public
// ──────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("=========================================");
        console.log(`📥 LOGIN ATTEMPT: Email entered -> "${email}"`);

        const isAdminEmail = email.startsWith('admin') || email.endsWith('@impactsprint.com');
        console.log(`🔍 LOGIN ROUTING: Is this routed as an admin? -> ${isAdminEmail}`);

        let account = null;
        if (isAdminEmail) {
            account = await Admin.findOne({ email });
            console.log(`🔍 DB SEARCH: Admin find result -> ${account ? "DOCUMENT FOUND" : "NOT FOUND IN DB"}`);
        } else {
            // 💡 FIX: Added .select("+password") to explicitly force Mongoose to fetch the hash from the DB row!
            account = await User.findOne({ email }).select("+password");
            console.log(`🔍 DB SEARCH: User find result -> ${account ? "DOCUMENT FOUND" : "NOT FOUND IN DB"}`);
        }

        if (!account) {
            console.log("❌ LOGIN FAIL: Account matching email does not exist.");
            console.log("=========================================");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log(`🔑 CRYPTO CHECK: Comparing text password against DB hash...`);
        const isMatch = await bcrypt.compare(password, account.password);
        console.log(`🔑 CRYPTO CHECK: Does password match hash? -> ${isMatch}`);

        if (!isMatch) {
            console.log("❌ LOGIN FAIL: Password comparison mismatch.");
            console.log("=========================================");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("🎯 LOGIN SUCCESS: Packaging response payload...");
        console.log("=========================================");
        
        return sendTokenResponse(account, 200, res);

    } catch (error) {
        console.error("🔥 LOGIN CRASH: Internal server error loop:", error.message);
        console.log("=========================================");
        return res.status(500).json({ message: "Internal server error" });
    }
};
// ──────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged-in user
// @access  Private
// ──────────────────────────────────────────
const getMe = async (req, res) => {
    // req.user is set by the protect middleware — returns ONLY this user's data
    res.status(200).json({ success: true, user: req.user });
};

// ──────────────────────────────────────────
// @route   PUT /api/auth/profile
// @desc    Update profile (name, profession, skills, bio, org etc.)
// @access  Private
// ──────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Not authorized — user not found in session" });
        }

        const fields = ["name", "profession", "skills", "bio", "linkedinUrl", "organization", "mission", "website", "avatar", "verification_url", "github_url"];
        const updates = {};
        fields.forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                organization: user.organization,
                bio: user.bio,
                avatar: user.avatar,
                profession: user.profession,
                linkedinUrl: user.linkedinUrl,
                mission: user.mission,
                website: user.website,
                verification_url: user.verification_url,
                github_url: user.github_url,
            },
        });
    } catch (err) {
        console.error("updateProfile error:", err);
        res.status(500).json({ message: err.message || "Profile update failed" });
    }
};

// ──────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Clear cookie
// @access  Private
// ──────────────────────────────────────────
const logout = async (req, res) => {
    res
        .status(200)
        .cookie("token", "none", {
            expires: new Date(Date.now() + 5 * 1000), // 5 seconds
            httpOnly: true,
        })
        .json({ success: true, message: "Logged out" });
};

// ──────────────────────────────────────────
// @route   GET /api/auth/users
// @desc    Admin: list all users
// @access  Private / Orchestrator
// ──────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────
// @route   DELETE /api/auth/users/:id
// @desc    Admin: delete a user
// @access  Private / Orchestrator
// ──────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userToDelete.role === "Orchestrator") {
            return res.status(403).json({ message: "Cannot delete admin account" });
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { seedAdmin, register, login, getMe, updateProfile, logout, getAllUsers, deleteUser };