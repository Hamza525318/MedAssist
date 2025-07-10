const express = require('express');
const router = express.Router();
const verifyJwt = require('../../middleware/auth');
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  rescheduleBookingsBySlot,
  rescheduleSingleBooking
} = require('../../controller/bookingController');



router.post("/create",verifyJwt,createBooking);
router.get("/get-bookings",verifyJwt,getBookings);
router.put("/update-booking/:id",verifyJwt,updateBooking);
router.delete("/delete-booking/:id",verifyJwt,deleteBooking);
router.post("/reschedule-slot",verifyJwt,rescheduleBookingsBySlot);
router.put("/reschedule-booking/:id",verifyJwt,rescheduleSingleBooking);

module.exports = router; 