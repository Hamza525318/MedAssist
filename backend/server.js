const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./utils/db");
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const patientRoute = require("./routes/patientRoute");
const aiRoute = require("./routes/aiRoutes");
const chatHistoryRoute = require("./routes/chatHistoryRoute");
const slotRoutes = require("./routes/slotRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads")); // Serve static files from uploads directory
app.use("/api/auth", authRoute); // Authentication routes
app.use("/api/patients", patientRoute); // Patient management routes
app.use("/api/ai",aiRoute); // AI routes
app.use("/api/chat-history",chatHistoryRoute); // Chat history routes
app.use("/api/slots",slotRoutes);
app.use("/api/prescription",prescriptionRoutes);
app.use("/api/bookings",bookingRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
