const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  profilePicture: {
    type: String,
    default: null
  },

  // CV & Cover Letter (optional)
  resumeUrl: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true
  },

  // Experience & Education
  experiences: [{
    company: String,
    title: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date
  }],
  skills: [String],

  // Meta
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
