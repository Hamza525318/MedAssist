const express = require("express");
const { loginUser, registerUser, getProfile, getAllDoctors } = require("../controller/userController");
const verifyJwt = require("../middleware/auth");
const verifyJwtPatient = require("../middleware/authPatient")
const {registerPatient,loginPatient,forgotPassword,resetPassword,logout,getMe} = require("../controller/user/authController")
const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);
// Protected routes (require JWT)
router.get("/profile", verifyJwt, getProfile);
router.get("/doctors", verifyJwt, getAllDoctors);

// Patient auth routes
router.post("/patients/register", registerPatient);
router.post("/patients/login", loginPatient);
router.post("/patients/forgot-password", forgotPassword);
router.put("/patients/reset-password/:resettoken", resetPassword);
router.get("/patients/logout", logout);
router.get("/patients/me", verifyJwtPatient, getMe);

module.exports = router;
