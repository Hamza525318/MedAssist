const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../models/Patient");
const LabReport = require("../models/LabReport");
const cloudinary = require("../utils/cloudinary");
const generatePatientId = require("../utils/generatedPatientId");

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

module.exports = {
  createNewPatient,
  getPatientDetails,
  updatePatientHistoryDetails,
  uploadReport,
  fetchPatientReports,
  getAllPatientDetails,
  deletePatient,
  deleteReport,
  searchPatientByQuery
};
