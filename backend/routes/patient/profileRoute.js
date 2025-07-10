const express = require('express');
const router = express.Router();
const verifyJwtPatient = require('../../middleware/authPatient');
const { 
  getPatientProfile,
  updatePatientProfile
} = require('../../controller/user/patientProfileController');

// Get patient profile
router.get('/', verifyJwtPatient, getPatientProfile);

// Update patient profile
router.put('/', verifyJwtPatient, updatePatientProfile);

module.exports = router;