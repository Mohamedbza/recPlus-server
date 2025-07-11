const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'interview', 'offer', 'hired', 'rejected'],
    default: 'new'
  },
  location: {
    type: String,
    required: true,
    enum: ['montreal', 'dubai', 'turkey'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
