const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
