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
  dateOfBirth: {
    type: Date
  },
  experience: {
    type: String
  },
  skills: [{
    type: String
  }],
  education: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'interview', 'offer', 'hired', 'rejected', 'waiting', 'active'],
    default: 'new'
  },
  profilePicture: {
    type: String,
    default: '/api/placeholder/150/150'
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
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});
 

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
