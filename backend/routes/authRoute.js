const express = require("express");
const { loginUser, registerUser, getProfile } = require("../controller/userController");
const verifyJwt = require("../middleware/auth");
const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Protected routes (require JWT)
router.get("/profile", verifyJwt, getProfile);

module.exports = router;
