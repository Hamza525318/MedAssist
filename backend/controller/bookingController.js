const BookingRequest = require('../models/BookingRequest');
const Slot = require('../models/Slot');
const Patient = require('../models/Patient');

// Create a new booking request
const createBooking = async (req, res) => {
  try {
    const { slotId, reason, patientId, patientData ,status} = req.body;
    console.log("Create Booking request",req.body);
    let finalPatientId = patientId;

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

    // If patientData is provided, create a new patient
    if (patientData) {
      // Generate a new patient ID (5 digits)
      const lastPatient = await Patient.findOne().sort({ patientId: -1 });
      const newPatientId = lastPatient ? lastPatient.patientId + 1 : 10000;

      // Create new patient
      const newPatient = await Patient.create({
        patientId: newPatientId,
        name: patientData.name,
        contactNumber: patientData.contactNumber,
        age: patientData.age,
        gender: patientData.gender,
        dob: new Date(patientData.dob)
      });

      finalPatientId = newPatient._id;
    }

    // Check if patient already has a booking for this slot
    const existingBooking = await BookingRequest.findOne({
      slotId,
      patientId: finalPatientId,
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
      patientId: finalPatientId,
      reason,
      status: status
    });

    // Increment slot's booked count
    await slot.incrementBookedCount();

    // Populate the booking with patient and slot details
    const populatedBooking = await BookingRequest.findById(booking._id)
      .populate('slotId', 'date startHour endHour location capacity bookedCount')
      .populate('patientId', 'name patientId contactNumber age gender dob');

    return res.status(201).json({
      success: true,
      data: populatedBooking
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
    const { 
      slotId, 
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    console.log("GET BOOKINGS",status);

    // Add filters if provided
    if (slotId) query.slotId = slotId;
    // if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { 'patientId.name': { $regex: search, $options: 'i' } },
        { 'patientId.patientId': { $regex: search, $options: 'i' } }
      ];
    }

    // If no filters provided, only show bookings for the logged-in user
    // if (!slotId && !patientId) {
    //   query.patientId = req.user.id;
    // }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await BookingRequest.countDocuments(query);
    console.log("BOOKINGS DB Query",query);
    const bookings = await BookingRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('slotId', 'date startHour endHour location capacity bookedCount doctorId')
      .populate('patientId', 'name patientId contactNumber age gender dob');

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
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