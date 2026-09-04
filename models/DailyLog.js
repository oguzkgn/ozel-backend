const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  water: { type: Number, default: 0 },
  mood: { type: Number, default: 5 },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
