const express = require('express');
const router = express.Router();
const verifyJwt = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking
} = require('../controller/bookingController');
const verifyJwt = require('../middleware/auth');


router.post("/create",verifyJwt,createBooking);
router.get("/get-bookings",verifyJwt,getBookings);
router.put("/update-booking",verifyJwt,updateBooking);
router.delete("/delete-booking",verifyJwt,deleteBooking);

module.exports = router; 