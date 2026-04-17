const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  getAllUsers,
  deleteUser,
} = require("../controllers/authController");

// Public
router.post("/register", register);
router.post("/login", login);

// Private
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/logout", protect, logout);

// Admin only
router.get("/users", protect, authorize("Orchestrator"), getAllUsers);
router.delete("/users/:id", protect, authorize("Orchestrator"), deleteUser);

module.exports = router;
