const Patient = require('../models/Patient');
const BookingRequest = require('../models/BookingRequest');
const Prescription = require('../models/Prescription');
const Slot = require('../models/Slot');

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private (Doctor/Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get current date and time
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    // Get start and end of current week
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 7); // End of week (next Sunday)
    
    // Get start and end of current month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Run all queries in parallel for better performance
    const [
      totalPatients,
      pendingBookings,
      todayBookings,
      followUpPatients,
      newMonthlyPatients
    ] = await Promise.all([
      // Total count of patients
      Patient.countDocuments({ active: true }),
      
      // Booking requests in pending state
      BookingRequest.countDocuments({ status: 'Pending' }),
      
      // Total bookings for today that are pending or accepted
      BookingRequest.countDocuments({
        status: { $in: ['Pending', 'Accepted'] },
        $expr: {
          $and: [
            { $gte: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
                    { $dateToString: { format: '%Y-%m-%d', date: today } }] },
            { $lt: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
                   { $dateToString: { format: '%Y-%m-%d', date: tomorrow } }] }
          ]
        }
      }),
      
      // Total follow-up patients count for current week
      Prescription.countDocuments({
        followUpDate: {
          $gte: currentWeekStart,
          $lt: currentWeekEnd
        }
      }),
      
      // Total new patients created in current month
      Patient.countDocuments({
        createdAt: {
          $gte: currentMonthStart,
          $lte: currentMonthEnd
        }
      })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        pendingBookings,
        todayBookings,
        followUpPatients,
        newMonthlyPatients
      }
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

/**
 * Get top 5 bookings for today
 * @route GET /api/dashboard/top-bookings
 * @access Private (Doctor/Admin)
 */
const getTopBookingsForToday = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    // Find slots for today
    const todaySlots = await Slot.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).select('_id');
    
    const slotIds = todaySlots.map(slot => slot._id);
    
    // Find bookings for today's slots
    const bookings = await BookingRequest.find({
      slotId: { $in: slotIds },
      status: { $in: ['Accepted'] }
    })
    .populate({
      path: 'patientId',
      select: 'name patientId contactNumber'
    })
    .populate({
      path: 'slotId',
      select: 'startHour endHour location'
    })
    .sort({ 'slotId.startHour': 1 }) // Sort by slot time
    .limit(5);
    
    // Format the response data
    const formattedBookings = bookings.map(booking => ({
      bookingId: booking._id,
      patientName: booking.patientId.name,
      patientId: booking.patientId.patientId,
      contactNumber: booking.patientId.contactNumber,
      time: `${booking.slotId.startHour}:00 - ${booking.slotId.endHour}:00`,
      location: booking.slotId.location,
      status: booking.status,
      reason: booking.reason
    }));
    
    res.status(200).json({
      success: true,
      data: formattedBookings
    });
    
  } catch (error) {
    console.error('Top bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top bookings'
    });
  }
};

module.exports = {
  getDashboardStats,
  getTopBookingsForToday
};