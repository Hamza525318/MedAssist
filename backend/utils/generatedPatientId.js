// utils/generatePatientId.js
const Patient = require("../models/Patient");

async function generatePatientId() {
  const lastPatient = await Patient.findOne().sort({ patientId: -1 }).lean();
  if (lastPatient && lastPatient.patientId) {
    return lastPatient.patientId + 1;
  }
  return 10001;
}

module.exports = generatePatientId;
