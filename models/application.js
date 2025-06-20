const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // References
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Application Details
  coverLetter: {
    type: String,
    trim: true
  },
  resume: {
    type: String,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Interview Details
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String,
    trim: true
  },
  interviewType: {
    type: String,
    enum: ['phone', 'video', 'onsite', 'technical', 'behavioral'],
    trim: true
  },
  interviewNotes: {
    type: String,
    trim: true
  },
  
  // Offer Details
  offerAmount: {
    type: Number
  },
  offerCurrency: {
    type: String,
    default: 'USD'
  },
  offerDeadline: {
    type: Date
  },
  offerAccepted: {
    type: Boolean
  },
  
  // Communication
  messages: [{
    sender: {
      type: String,
      enum: ['candidate', 'company', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Ratings and Feedback
  candidateRating: {
    type: Number,
    min: 1,
    max: 5
  },
  companyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
  
  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application; 