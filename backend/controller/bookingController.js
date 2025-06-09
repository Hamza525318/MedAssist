const BookingRequest = require('../models/BookingRequest');
const Slot = require('../models/Slot');

// Create a new booking request
const createBooking = async (req, res) => {
  try {
    const { slotId, reason } = req.body;
    const patientId = req.user.id; // From auth middleware

    // Validate required fields
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Check if slot exists and has capacity
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (!slot.canAcceptBooking()) {
      return res.status(400).json({
        success: false,
        message: 'Slot is already full'
      });
    }

    // Check if patient already has a booking for this slot
    const existingBooking = await BookingRequest.findOne({
      slotId,
      patientId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking for this slot'
      });
    }

    // Create booking request
    const booking = await BookingRequest.create({
      slotId,
      patientId,
      reason
    });

    // Increment slot's booked count
    await slot.incrementBookedCount();

    return res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get bookings with filters
const getBookings = async (req, res) => {
  try {
    const { slotId, patientId, status } = req.query;
    const query = {};

    // Add filters if provided
    if (slotId) query.slotId = slotId;
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    // If no filters provided, only show bookings for the logged-in user
    if (!slotId && !patientId) {
      query.patientId = req.user.id;
    }

    const bookings = await BookingRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('slotId', 'date hour location')
      .populate('patientId', 'name email');

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update booking status
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Pending', 'Accepted', 'Rejected', 'CheckedIn', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find booking
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get slot
    const slot = await Slot.findById(booking.slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Associated slot not found'
      });
    }

    // Handle status changes
    const oldStatus = booking.status;
    await booking.updateStatus(status);

    // Update slot's booked count based on status change
    if (oldStatus === 'Accepted' && status === 'Rejected') {
      await slot.decrementBookedCount();
    } else if (oldStatus === 'Pending' && status === 'Accepted') {
      await slot.incrementBookedCount();
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get slot
    const slot = await Slot.findById(booking.slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Associated slot not found'
      });
    }

    // Decrement slot's booked count if booking was accepted
    if (booking.status === 'Accepted') {
      await slot.decrementBookedCount();
    }

    // Delete booking
    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking
}; 