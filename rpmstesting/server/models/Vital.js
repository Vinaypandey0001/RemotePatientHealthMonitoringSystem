const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  heartRate: Number,
  bloodPressure: Number,
  temperature: Number,
  spo2: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vital', vitalSchema);
