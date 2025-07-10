const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../models/Patient");
const LabReport = require("../models/LabReport");
const cloudinary = require("../utils/cloudinary");
const generatePatientId = require("../utils/generatedPatientId");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const createNewPatient = async (req, res) => {
  const { name, dob, gender, contact, address, history,age } = req.body;
  console.log("PATIENT DATA", req.body);

  if (!name || !dob || !gender || !age) {
    return res
      .status(400)
      .json({ message: "name, dob, age, and gender are required." });
  }

  try {
    // Generate unique 5-digit patientId
    const newPatientId = await generatePatientId();

    // Optional initial history
    const historyArray = [];
    if (Array.isArray(history) && history.length > 0) {
      history.map((item) => {
        historyArray.push({
          note: item.note,
          field: item.field,
          addedBy: req.user.id,
          date: new Date(),
        });
      });
    }

    const newPatient = new Patient({
      patientId: newPatientId,
      name,
      dob,
      gender,
      contactNumber: contact,
      address,
      history: historyArray,
      age,
    });

    await newPatient.save();

    return res.status(201).json({ success: true, data: newPatient });
  } catch (err) {
    console.error("Create Patient Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPatientDetails = async (req, res) => {
  const { patientId } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: "patientId is required." });
  }
  try {
    const patient = await Patient.findById(patientId)
      .populate("labReports")
      .populate("history.addedBy", "name email");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error("Get Patient Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updatePatientHistoryDetails = async (req, res) => {
  const { patientId, name, age, gender, contact, address, history, dob } =
    req.body;

  console.log("Update Patient Data:", req.body);

  if (!patientId) {
    return res.status(400).json({ message: "patientId is required." });
  }

  try {
    const updateFields = {};

    if (name) updateFields.name = name;
    if (age) updateFields.age = age;
    if (gender) updateFields.gender = gender;
    if (contact) updateFields.contactNumber = contact;
    if (address) updateFields.address = address;
    if (dob) updateFields.dob = dob;

    // Handle new history entries
    if (Array.isArray(history) && history.length > 0) {
      updateFields.$push = {
        history: {
          $each: history.map((item) => ({
            note: item.note,
            field: item.field,
            addedBy: req.user.id,
            date: new Date(),
          })),
        },
      };
    }

    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: Number(patientId) },
      updateFields,
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    res.status(200).json({
      success: true,
      data: updatedPatient,
    });
  } catch (err) {
    console.error("Update Patient Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadReport = async (req, res) => {
  const { patientId, reportType, name } = req.body;
  console.log("UPLOAD REPORT DATA", req.body,req.file.path);
  if (!patientId || !reportType) {
    return res
      .status(400)
      .json({ message: "patientId and reportType are required." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "reportFile is required." });
  }

  try {
    // Ensure patient exists
    const patient = await Patient.findOne({ patientId: Number(patientId) });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'health-care-bot/reports',
      resource_type: 'auto',
      public_id: `${patientId}_${Date.now()}`,
    });

    // Remove the temporary file
    fs.unlinkSync(req.file.path);

    // Save lab report document with Cloudinary URL
    const labReport = new LabReport({
      patient: patient._id,
      name: name || `${reportType} Report - ${new Date().toLocaleDateString()}`, // Use provided name or generate a default one
      reportType,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      addedBy: req.user.id,
    });
    await labReport.save();

    // Link to Patient
    patient.labReports.push(labReport._id);
    await patient.save();

    return res.status(201).json({ success: true, data: labReport });
  } catch (err) {
    console.error("Upload Lab Report Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const fetchPatientReports = async (req, res) => {
  const { patientId, filter, page = 1, limit = 10 } = req.body;
  
  if (!patientId) {
    return res.status(400).json({ message: "patientId is required." });
  }
  
  try {
    // Build query
    const patient = await Patient.findOne({ patientId: Number(patientId) });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    const query = { patient: patient._id };
    
    // Add filter for reportType if provided
    if (filter && filter.reportType) {
      query.reportType = new RegExp(filter.reportType, 'i');
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find reports with pagination
    const reports = await LabReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'name email')
      .lean();
    
    // Get total count for pagination
    const totalCount = await LabReport.countDocuments(query);
    
    return res.json({ 
      success: true, 
      data: reports,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    console.error("Fetch Reports Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPatientDetails = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.body;
  // console.log("GET ALL PATIENT DATA", req.body);
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const searchRegex = new RegExp(search, "i");

  try {
    const filter = { $or: [] };

    if (search) {
      filter.$or.push(
        { name: searchRegex },
        { contactNumber: searchRegex }
      );

      // If search is all digits, also search by patientId
      if (/^\d+$/.test(search)) {
        filter.$or.push({ patientId: Number(search) });
      }
    }

    const query = search ? filter : {};

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("history.addedBy", "name email");

    const totalCount = await Patient.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const deletePatient = async (req, res) => {
  const { patientId } = req.body;
  console.log("Delete Patient Data:", req.body);
  if (!patientId) {
    return res.status(400).json({ message: "patientId is required." });
  }

  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Delete associated lab reports if needed
    await LabReport.deleteMany({ patient: patientId });

    // Delete the patient
    await Patient.findByIdAndDelete(patientId);

    return res.json({
      success: true,
      message: "Patient and related reports deleted.",
    });
  } catch (err) {
    console.error("Delete Patient Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete a lab report
 * @route DELETE /api/patients/report/:reportId
 */
const deleteReport = async (req, res) => {
  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ message: "Report ID is required." });
  }

  try {
    // Find the report
    const report = await LabReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (report.cloudinaryId) {
      await cloudinary.uploader.destroy(report.cloudinaryId);
    }

    // Remove report reference from patient
    await Patient.findByIdAndUpdate(
      report.patient,
      { $pull: { labReports: reportId } }
    );

    // Delete the report from database
    await LabReport.findByIdAndDelete(reportId);

    return res.json({ success: true, message: "Report deleted successfully." });
  } catch (err) {
    console.error("Delete Report Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchPatientByQuery = async (req, res) => {
  try {
    const { search = '' } = req.query;

    console.log('SEARCH QUERY FOR PATIENTS',search);

    if (!search.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required.'
      });
    }

    const searchRegex = new RegExp(search, 'i');
    const filter = {
      $or: []
    };

    // Add search by contact number or name
    filter.$or.push(
      { contactNumber: searchRegex },
      { name: searchRegex }
    );

    // If numeric, also try to match patientId
    if (/^\d+$/.test(search)) {
      filter.$or.push({ patientId: Number(search) });
    }

    const results = await Patient.find(filter).limit(10).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Search Patient Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Generate Patient Medical History PDF
const generatePatientHistoryPDF = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find patient with all details and populate the addedBy field in history
    const patient = await Patient.findOne({ patientId })
      .populate('labReports')
      .populate({
        path: 'history.addedBy',
        select: 'name' // Only get the name of the user who added the history
      });
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Format date function
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Embed fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set initial position
    let y = height - 50;
    const leftMargin = 50;
    
    // Draw header
    page.drawText('PATIENT MEDICAL RECORD', { 
      x: width / 2 - 100, 
      y, 
      size: 16, 
      font: boldFont,
      color: rgb(0, 0.5, 0.5) // Teal color
    });
    
    // Draw patient basic info
    y -= 40;
    page.drawText(`Patient ID: ${patient.patientId}`, { x: leftMargin, y, size: 12, font: boldFont });
    y -= 25;
    page.drawText(`Name: ${patient.name}`, { x: leftMargin, y, size: 12, font: regularFont });
    y -= 20;
    page.drawText(`Gender: ${patient.gender}`, { x: leftMargin, y, size: 12, font: regularFont });
    y -= 20;
    page.drawText(`Date of Birth: ${formatDate(patient.dob)} (Age: ${patient.age})`, { x: leftMargin, y, size: 12, font: regularFont });
    
    if (patient.contactNumber) {
      y -= 20;
      page.drawText(`Contact: ${patient.contactNumber}`, { x: leftMargin, y, size: 12, font: regularFont });
    }
    
    if (patient.email) {
      y -= 20;
      page.drawText(`Email: ${patient.email}`, { x: leftMargin, y, size: 12, font: regularFont });
    }
    
    if (patient.address) {
      y -= 20;
      page.drawText(`Address: ${patient.address}`, { x: leftMargin, y, size: 12, font: regularFont });
    }
    
    // Draw line separator
    y -= 30;
    page.drawLine({
      start: { x: leftMargin, y },
      end: { x: width - leftMargin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    // Draw medical history section
    y -= 30;
    page.drawText('MEDICAL HISTORY', { x: leftMargin, y, size: 14, font: boldFont, color: rgb(0, 0.5, 0.5) });
    
    if (patient.history && patient.history.length > 0) {
      // Sort history by date (newest first)
      const sortedHistory = [...patient.history].sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log("Sorted History", patient.history);
      
      y -= 20;
      sortedHistory.forEach((item, index) => {
        // Check if we need a new page
        if (y < 100) {
          // Add new page
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
          page.drawText('MEDICAL HISTORY (Continued)', { 
            x: leftMargin, 
            y, 
            size: 14, 
            font: boldFont,
            color: rgb(0, 0.5, 0.5)
          });
          y -= 30;
        }
        
        // Get the name of the person who added this history entry
        const addedByName = item.addedBy ? item.addedBy.name : 'System';
        
        // Draw history item with the name of who added it
        page.drawText(`${index + 1}. ${item.field} (${formatDate(item.date)}) - Added by: ${addedByName}`, { 
          x: leftMargin, 
          y, 
          size: 12, 
          font: boldFont 
        });
        y -= 20;
        
        // Handle multi-line notes by wrapping text
        const noteLines = wrapText(item.note, 70); // ~70 chars per line
        noteLines.forEach(line => {
          page.drawText(line, { x: leftMargin + 15, y, size: 11, font: regularFont });
          y -= 18;
        });
        
        y -= 10; // Extra space between history items
      });
    } else {
      y -= 20;
      page.drawText('No medical history records available.', { x: leftMargin + 15, y, size: 11, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
      y -= 20;
    }
    
    // Draw line separator
    y -= 20;
    page.drawLine({
      start: { x: leftMargin, y },
      end: { x: width - leftMargin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    // Draw lab reports section if available
    y -= 30;
    page.drawText('LAB REPORTS', { x: leftMargin, y, size: 14, font: boldFont, color: rgb(0, 0.5, 0.5) });
    
    if (patient.labReports && patient.labReports.length > 0) {
      y -= 20;
      patient.labReports.forEach((report, index) => {
        // Check if we need a new page
        if (y < 100) {
          // Add new page
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
          page.drawText('LAB REPORTS (Continued)', { 
            x: leftMargin, 
            y, 
            size: 14, 
            font: boldFont,
            color: rgb(0, 0.5, 0.5)
          });
          y -= 30;
        }
        
        // Draw report info
        page.drawText(`${index + 1}. ${report.reportType || 'Lab Report'} (${formatDate(report.date)})`, { 
          x: leftMargin, 
          y, 
          size: 12, 
          font: boldFont 
        });
        y -= 20;
        
        if (report.description) {
          const descLines = wrapText(report.description, 70);
          descLines.forEach(line => {
            page.drawText(line, { x: leftMargin + 15, y, size: 11, font: regularFont });
            y -= 18;
          });
        }
        
        if (report.fileUrl) {
          page.drawText(`File available online`, { 
            x: leftMargin + 15, 
            y, 
            size: 11, 
            font: regularFont,
            color: rgb(0, 0, 0.8)
          });
          y -= 18;
        }
        
        y -= 10; // Extra space between reports
      });
    } else {
      y -= 20;
      page.drawText('No lab reports available.', { x: leftMargin + 15, y, size: 11, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
      y -= 20;
    }
    
    // Add footer with generation date
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    lastPage.drawText(`Generated on: ${formatDate(new Date())}`, { 
      x: width - 200, 
      y: 30, 
      size: 10, 
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Save PDF to file
    const pdfBytes = await pdfDoc.save();
    const fileName = `patient_${patient.patientId}_history_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, `../../backend/uploads/patients/${fileName}`);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.promises.writeFile(filePath, pdfBytes);
    
    // Send file as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (err) {
    console.error('Generate Patient History PDF Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper function to wrap text
function wrapText(text, maxCharsPerLine) {
  if (!text) return ['N/A'];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines.length ? lines : ['N/A'];
}

module.exports = {
  createNewPatient,
  getPatientDetails,
  updatePatientHistoryDetails,
  uploadReport,
  fetchPatientReports,
  getAllPatientDetails,
  deletePatient,
  deleteReport,
  searchPatientByQuery,
  generatePatientHistoryPDF
};
