// models/Patient.js
const mongoose = require("mongoose");

// Helper schema for history entries
const HistorySchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    field: { type: String, required: true },
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    history: [HistorySchema],
    labReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabReport",
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
