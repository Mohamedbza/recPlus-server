const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  contractType: {
    type: String,
    enum: ['permanent', 'contract', 'temporary', 'internship'],
    default: 'permanent'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  department: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  responsibilities: [String],
  qualifications: [String],
  benefits: [String],
  skills: [String],
  applicationDeadline: Date,
  applicationUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'closed', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  applications: {
    type: Number,
    default: 0,
    min: 0
  },
  flags: {
    isFeatured: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
