const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strength: { type: String }, // e.g., "500mg"
  frequency: { type: String }, // e.g., "Twice a day"
  duration: { type: String }, // e.g., "5 days"
  notes: { type: String }     // Optional remarks
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    required: true,
    unique: true // Optional: RX10005 or UUID
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Auto-filled snapshot of patient info at time of creation
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  patientContact: { type: String },

  // Auto-filled doctor metadata
  doctorName: { type: String, required: true },
  signatureUrl: { type: String }, // signed image URL or base64

  // Core prescription fields
  diagnosis: { type: String, required: true },
  medications: [MedicationSchema],
  advice: { type: String ,default: null},
  followUpDate: { type: Date ,default: null},

  
  verificationCode: { type: String },

  // Optional PDF linkage
  pdfUrl: { type: String },
  cloudinaryId: { type: String, default: null },

}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Prescription', PrescriptionSchema);
