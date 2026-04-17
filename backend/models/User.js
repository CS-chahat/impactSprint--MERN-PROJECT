const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ["Orchestrator", "NGO", "Professional"],
      default: "Professional",
    },

    // ── Professional-specific fields ──
    profession: { type: String, default: "" },
    skills: [{ type: String }],
    bio: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    verification_url: { type: String, default: "" },
    github_url: { type: String, default: "" },

    // ── NGO-specific fields ──
    organization: { type: String, default: "" },
    registrationId: { type: String, default: "" }, // Tax ID / Charity Registration Number
    mission: { type: String, default: "" },
    website: { type: String, default: "" },

    // ── Shared ──
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Hash password before save ──
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare passwords ──
UserSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
