const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, default: "ImpactSprint Admin" },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "Orchestrator" },
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// This explicitly creates a separate collection named 'admins' in your database
module.exports = mongoose.model('Admin', AdminSchema);