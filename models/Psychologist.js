// models/Psychologist.js
const mongoose = require('mongoose');

const PsychologistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slots: [{
    type: Date,
    required: true,
  }],
});

module.exports = mongoose.models.Psychologist || mongoose.model('Psychologist', PsychologistSchema);