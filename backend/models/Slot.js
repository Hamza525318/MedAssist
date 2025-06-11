const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  endHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure one slot per doctor/date/time range
SlotSchema.index({ doctorId: 1, date: 1, startHour: 1, endHour: 1 }, { unique: true });

// Virtual for checking if slot is full
SlotSchema.virtual('isFull').get(function() {
  return this.bookedCount >= this.capacity;
});

// Method to check if slot can accept more bookings
SlotSchema.methods.canAcceptBooking = function() {
  return this.bookedCount < this.capacity;
};

// Method to increment booked count
SlotSchema.methods.incrementBookedCount = async function() {
  if (!this.canAcceptBooking()) {
    throw new Error('Slot is already full');
  }
  this.bookedCount += 1;
  return this.save();
};

// Method to decrement booked count
SlotSchema.methods.decrementBookedCount = async function() {
  if (this.bookedCount > 0) {
    this.bookedCount -= 1;
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('Slot', SlotSchema); 