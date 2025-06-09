const Slot = require('../models/Slot');

// Create a new slot
const createSlot = async (req, res) => {
  try {
    const { date, hour, capacity, location } = req.body;
    const doctorId = req.user.id; // From auth middleware

    // Validate required fields
    if (!date || !hour || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new slot
    const slot = await Slot.create({
      doctorId,
      date,
      hour,
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
    const { date, doctorId } = req.query;
    const query = {};

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
      .sort({ date: 1, hour: 1 })
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
    const { capacity, location } = req.body;

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