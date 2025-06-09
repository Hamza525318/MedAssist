const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking
} = require('../controller/bookingController');

// All routes require authentication
router.use(protect);

// Patient routes
router.route('/')
  .post(authorize('patient'), createBooking)
  .get(getBookings);

// Doctor routes for managing bookings
router.route('/:id')
  .put(authorize('doctor'), updateBooking)
  .delete(authorize('doctor', 'patient'), deleteBooking);

module.exports = router; 