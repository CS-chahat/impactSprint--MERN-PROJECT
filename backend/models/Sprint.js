const mongoose = require("mongoose");

const SprintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sprint title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: [
        "Education",
        "Healthcare",
        "Environment",
        "Technology",
        "Community",
        "Other",
      ],
      default: "Other",
    },
    ngoName: {
      type: String,
      default: "",
    },
    requiredSkills: [{ type: String }],

    // ── Micro-task constraint: 2–5 hours ──
    timeCommitment: {
      type: Number,
      required: [true, "Time commitment is required"],
      min: [2, "Minimum time commitment is 2 hours"],
      max: [5, "Maximum time commitment is 5 hours"],
    },

    budget: {
      type: Number,
      default: 0, // $0 — volunteer-only
    },

    // ── Workflow status ──
    status: {
      type: String,
      enum: ["POSTED", "IN_PROGRESS", "PENDING_APPROVAL", "COMPLETED"],
      default: "POSTED",
    },

    // ── Relationships ──
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Deliverable / proof ──
    submissionNote: { type: String, default: "" },
    submissionUrl: { type: String, default: "" },

    // ── Revision flag ──
    flaggedForRevision: { type: Boolean, default: false },
    revisionNote: { type: String, default: "" },

    // ── Timestamps for workflow tracking ──
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", SprintSchema);
