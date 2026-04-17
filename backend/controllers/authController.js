const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Fixed Admin Credentials ──
const ADMIN_EMAIL = "admin@impactsprint.com";
const ADMIN_PASSWORD = "Admin@2026!#";

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
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: "ImpactSprint Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "Orchestrator",
        isVerified: true,
      });
      console.log("🔑 Admin account seeded");
    } else {
      // Always enforce Orchestrator role
      if (admin.role !== "Orchestrator") {
        admin.role = "Orchestrator";
        await admin.save();
        console.log("🔑 Admin role corrected to Orchestrator");
      }
    }
  } catch (err) {
    console.error("Admin seed error:", err.message);
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
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Fetch user WITH password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Ensure fixed admin always keeps Orchestrator role
    if (email === ADMIN_EMAIL && user.role !== "Orchestrator") {
      user.role = "Orchestrator";
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
