const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'function'],
    default: 'user'
  },
  content: { type: String, required: true },
  functionName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ChatHistorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // user-given chat title
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  messages: [MessageSchema],
  startedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
