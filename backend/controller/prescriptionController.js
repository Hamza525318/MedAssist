// controller/prescriptionController.js
const Prescription = require('../models/Prescription');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('../utils/cloudinary');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

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
    // Allow both PDF and image files
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).fields([
  { name: 'signature', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);


// Create Prescription with PDF generation
const createPrescription = (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
  
      try {
        let pdfUrl = null;
        let cloudinaryId = null;
        let signatureUrl = null;
  
        // Handle signature upload if exists
        if (req.files && req.files['signature']) {
          const signatureFile = req.files['signature'][0];
          const result = await cloudinary.uploader.upload(signatureFile.path, {
            folder: 'health-care-bot/signatures',
            resource_type: 'image',
            public_id: `signature_${Date.now()}`,
          });
          signatureUrl = result.secure_url;
          await fs.unlink(signatureFile.path);
        }
  
        // Parse medications from JSON string
        const medications = JSON.parse(req.body.medications || '[]');
        const prescriptionId = 'RX' + uuidv4().slice(0, 8).toUpperCase();
  
        // Create prescription instance
        const prescription = new Prescription({
          prescriptionId,
          patientId: req.body.patientId,
          doctorId: req.body.doctorId,
          patientName: req.body.patientName,
          age: parseInt(req.body.age),
          gender: req.body.gender,
          patientContact: req.body.patientContact,
          doctorName: req.body.doctorName,
          signatureUrl: signatureUrl || req.body.signatureUrl,
          diagnosis: req.body.diagnosis,
          medications,
          advice: req.body.advice,
          followUpDate: req.body.followUpDate,
          verificationCode: uuidv4().slice(0, 6).toUpperCase()
        });
  
        // Generate PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
        let y = height - 50;
        page.drawText(`Prescription ID: ${prescription.prescriptionId}`, { x: 50, y, size: 12, font });
        y -= 20;
        page.drawText(`Patient: ${prescription.patientName} (${prescription.age}, ${prescription.gender})`, { x: 50, y, size: 12, font });
        y -= 20;
        page.drawText(`Diagnosis: ${prescription.diagnosis}`, { x: 50, y, size: 12, font });
        y -= 30;
        page.drawText(`Medications:`, { x: 50, y, size: 12, font });
  
        medications.forEach((med, idx) => {
          y -= 20;
          page.drawText(`- ${med.name}, ${med.strength || ''}, ${med.frequency || ''}, ${med.duration || ''}`, {
            x: 60, y, size: 11, font
          });
        });
  
        if (prescription.advice) {
          y -= 30;
          page.drawText(`Advice: ${prescription.advice}`, { x: 50, y, size: 12, font });
        }
  
        y -= 40;
        page.drawText(`Doctor: ${prescription.doctorName}`, { x: 50, y, size: 12, font });
  
        // Save PDF locally then upload to Cloudinary
        const pdfBytes = await pdfDoc.save();
        const tempPath = path.join(__dirname, `../../backend/uploads/${prescription.prescriptionId}.pdf`);
        await fs.writeFile(tempPath, pdfBytes);
  
        const uploadResult = await cloudinary.uploader.upload(tempPath, {
          folder: 'health-care-bot/prescriptions',
          resource_type: 'raw',
          public_id: `prescription_${Date.now()}`,
        });
  
        prescription.pdfUrl = uploadResult.secure_url;
        prescription.cloudinaryId = uploadResult.public_id;
        await fs.unlink(tempPath);
  
        await prescription.save();
        res.status(201).json({ success: true, data: prescription });
      } catch (err) {
        console.error('Create Prescription Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
      }
    });
};

const updatePrescription = async (req, res) => {
    try {
      const {
        _id, patientId, doctorId, patientName, age, gender, patientContact,
        doctorName, signatureUrl, diagnosis, medications,
        advice, followUpDate
      } = req.body;
  
      const existing = await Prescription.findById(_id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }
  
      // Delete old PDF from Cloudinary
      if (existing.cloudinaryId) {
        await cloudinary.uploader.destroy(existing.cloudinaryId);
      }
  
      // Generate new PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      let y = height - 50;
      page.drawText(`Prescription ID: ${existing.prescriptionId}`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Patient: ${patientName} (${age}, ${gender})`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Diagnosis: ${diagnosis}`, { x: 50, y, size: 12, font });
      y -= 30;
      page.drawText(`Medications:`, { x: 50, y, size: 12, font });
  
      const meds = JSON.parse(medications);
      meds.forEach((med, idx) => {
        y -= 20;
        page.drawText(`- ${med.name}, ${med.strength || ''}, ${med.frequency || ''}, ${med.duration || ''}`, {
          x: 60, y, size: 11, font
        });
      });
  
      if (advice) {
        y -= 30;
        page.drawText(`Advice: ${advice}`, { x: 50, y, size: 12, font });
      }
  
      y -= 40;
      page.drawText(`Doctor: ${doctorName}`, { x: 50, y, size: 12, font });
  
      const pdfBytes = await pdfDoc.save();
      const tempPath = path.join(__dirname, `../../temp/${existing.prescriptionId}_updated.pdf`);
      await fs.writeFile(tempPath, pdfBytes);
  
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        folder: 'health-care-bot/prescriptions',
        resource_type: 'raw',
        public_id: `prescription_${Date.now()}`,
      });
  
      await fs.unlink(tempPath);
  
      // Update prescription document
      existing.patientId = patientId;
      existing.doctorId = doctorId;
      existing.patientName = patientName;
      existing.age = age;
      existing.gender = gender;
      existing.patientContact = patientContact;
      existing.doctorName = doctorName;
      existing.signatureUrl = signatureUrl;
      existing.diagnosis = diagnosis;
      existing.medications = meds;
      existing.advice = advice;
      existing.followUpDate = followUpDate;
      existing.pdfUrl = uploadResult.secure_url;
      existing.cloudinaryId = uploadResult.public_id;
  
      const updated = await existing.save();
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      console.error('Update Error:', err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
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



// Delete prescription
const deletePrescription = async (req, res) => {
    try {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Not Found' });
      }
  
      // Delete from Cloudinary if cloudinaryId exists
      if (prescription.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(prescription.cloudinaryId, { 
            resource_type: 'raw',
            invalidate: true 
          });
        } catch (cloudinaryErr) {
          console.error('Cloudinary deletion error:', cloudinaryErr);
          // Continue with deletion even if Cloudinary deletion fails
        }
      }
  
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