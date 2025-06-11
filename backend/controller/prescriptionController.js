// controller/prescriptionController.js
const Prescription = require('../models/Prescription');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('../utils/cloudinary');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/prescriptions';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('pdf');

// Create Prescription
const createPrescription = (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
  
      try {
        let pdfUrl = null;
        let cloudinaryId = null;
  
        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'health-care-bot/prescriptions',
            resource_type: 'auto',
            public_id: `prescription_${Date.now()}`,
          });
          pdfUrl = result.secure_url;
          cloudinaryId = result.public_id;
          await fs.unlink(req.file.path);
        }
  
        const {
          patientId, doctorId, patientName, age, gender, patientContact,
          doctorName, signatureUrl, diagnosis, medications,
          advice, followUpDate
        } = req.body;
  
        const prescription = new Prescription({
          prescriptionId: 'RX' + uuidv4().slice(0, 8).toUpperCase(),
          patientId,
          doctorId,
          patientName,
          age,
          gender,
          patientContact,
          doctorName,
          signatureUrl,
          diagnosis,
          medications,
          advice,
          followUpDate,
          verificationCode: uuidv4().slice(0, 6).toUpperCase(),
          pdfUrl,
          cloudinaryId
        });
  
        await prescription.save();
        res.status(201).json({ success: true, data: prescription });
      } catch (err) {
        console.error('Create Prescription Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
      }
    });
  };

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: prescriptions });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get prescriptions by patient ID
const getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: prescriptions });
  } catch (err) {
    console.error('Fetch by Patient ID Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    res.status(200).json({ success: true, data: prescription });
  } catch (err) {
    console.error('Fetch by ID Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
    try {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Not Found' });
      }
  
      // Delete from Cloudinary if cloudinaryId exists
      if (prescription.cloudinaryId) {
        await cloudinary.uploader.destroy(prescription.cloudinaryId, { resource_type: 'raw' });
      }
  
      // Set pdfUrl and cloudinaryId to null
      prescription.pdfUrl = null;
      prescription.cloudinaryId = null;
      await prescription.save();
  
      // Delete the prescription from database
      await Prescription.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      console.error('Delete Error:', err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createPrescription,
    updatePrescription,
    deletePrescription,
    getPrescriptionById,
    getAllPrescriptions,
    getPrescriptionsByPatientId
}