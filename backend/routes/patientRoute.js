const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const verifyJwt = require("../middleware/auth");
const {
  createNewPatient,
  getPatientDetails,
  updatePatientHistoryDetails,
  uploadReport,
  fetchPatientReports,
  getAllPatientDetails,
  deletePatient,
  deleteReport,
  searchPatientByQuery,
} = require("../controller/patientController");
const router = express.Router();

// Configure multer storage: save files under /uploads
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/add-patient", verifyJwt, createNewPatient);
router.post("/get-patient-details", verifyJwt, getPatientDetails);
router.post("/update-patient-details", verifyJwt, updatePatientHistoryDetails);
router.post(
  "/upload-lab-report",
  verifyJwt,
  upload.single("reportFile"),
  uploadReport
);
router.post("/delete-lab-report", verifyJwt,deleteReport);
router.post("/get-patient-reports", verifyJwt, fetchPatientReports);
router.post("/get-all-patients", verifyJwt, getAllPatientDetails);
router.post("/delete-patient", verifyJwt, deletePatient);
router.get("/search-patient",verifyJwt,searchPatientByQuery)

module.exports = router;
