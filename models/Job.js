const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Rejected', 'Offer', 'Accepted'],
    default: 'Applied',
  },
  appliedDate: { type: Date, required: true },
  followUpDate: { type: Date },
  notes: { type: String },
  resume: { type: String, required: true }, // Store file path or URL for the resume used
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Job', JobSchema);
