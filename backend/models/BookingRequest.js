const mongoose = require('mongoose');

const BookingRequestSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'CheckedIn', 'Completed'],
    default: 'Pending'
  },
  reason: {
    type: String,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
BookingRequestSchema.index({ slotId: 1, patientId: 1 });
BookingRequestSchema.index({ status: 1 });

// Method to update status
BookingRequestSchema.methods.updateStatus = async function(newStatus) {
  if (!['Pending', 'Accepted', 'Rejected', 'CheckedIn', 'Completed'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  this.status = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Pre-save middleware to update updatedAt
BookingRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('BookingRequest', BookingRequestSchema); 