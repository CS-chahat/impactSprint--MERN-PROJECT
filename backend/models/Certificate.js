const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      required: true,
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    taskName: {
      type: String,
      default: "",
    },
    professionalName: {
      type: String,
      default: "",
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", CertificateSchema);
