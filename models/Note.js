const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  metin: {
    type: String,
    required: true
  },
  fotografUrl: {
    type: String,
    required: false
  },
  tarih: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
