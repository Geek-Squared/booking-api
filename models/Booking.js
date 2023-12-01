// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slot: {
    type: Date,
    required: true,
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Psychologist',
    required: true,
  },
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);