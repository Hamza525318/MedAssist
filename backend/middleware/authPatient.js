const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Patient = require("../models/Patient")

dotenv.config();

async function verifyJwtPatient(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or malformed Authorization header" });
    }
  
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Patient.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach user info to request
      req.user = {
        id: user._id,
        email: user.email,
        role: 'patient',
      };
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = verifyJwtPatient;