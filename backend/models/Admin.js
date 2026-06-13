const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    name: { 
        type: String, 
        default: "ImpactSprint Admin" 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: "Orchestrator" 
    },
    isVerified: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Automatically hash the admin password before saving it to the database
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// backend/models/Admin.js

// 💡 Force a completely fresh collection name path:
module.exports = mongoose.model('Admin', AdminSchema, 'system_admins');
// This explicitly creates a separate collection named 'admins' in your database
