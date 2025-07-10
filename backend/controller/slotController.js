const Slot = require('../models/Slot');

// Create a new slot
const createSlot = async (req, res) => {
  try {
    const { date, startHour, endHour, capacity, location, doctorId } = req.body;
    console.log("CREATE SLOT DATA", req.body);
    
    // Use doctorId from request body if provided, otherwise use the authenticated user's ID
    const slotDoctorId = doctorId || req.user.id;

    // Validate required fields
    if (!date || !startHour || !endHour || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate time range
    if (startHour >= endHour) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Create new slot
    const slot = await Slot.create({
      doctorId: slotDoctorId,
      date,
      startHour,
      endHour,
      capacity,
      location
    });

    return res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Slot already exists for this time'
      });
    }
    console.error('Create slot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get slots with filters
const getSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.body;
    const query = {};

    console.log("GET SLOTS QUERY",req.body);

    // Add filters if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (doctorId) {
      query.doctorId = doctorId;
    } else {
      // If no doctorId provided, only show slots for the logged-in doctor
      query.doctorId = req.user.id;
    }

    const slots = await Slot.find(query)
      .sort({ date: -1, startHour: 1 })
      .populate('doctorId', 'name email');

    return res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Get slots error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a slot
const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('UPDATE SLOT DETAILS',id);
    const {date, startHour, endHour, capacity, location } = req.body;

    // Find slot and verify ownership
    const slot = await Slot.findOne({ _id: id, doctorId: req.user.id });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Update allowed fields
    if (capacity !== undefined) slot.capacity = capacity;
    if (location) slot.location = location;
    if (date) slot.date = date;
    if (startHour) slot.startHour = startHour;
    if (endHour) slot.endHour = endHour;

    await slot.save();

    return res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    console.error('Update slot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a slot
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("DELETE SLOT API",req.params);

    // Find slot and verify ownership
    const slot = await Slot.findOne({ _id: id, doctorId: req.user.id });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Check if slot has any bookings
    if (slot.bookedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slot with existing bookings'
      });
    }

    await slot.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete slot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot
}; 