const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  industry: {
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
  location: {
    type: String,
    required: true,
    enum: ['montreal', 'dubai', 'turkey'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },

  // Media
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    trim: true
  },

  // Social
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },

  // Legal
  foundedYear: {
    type: Number,
    min: 1800
  },
  registrationNumber: String,
  taxId: String,

  // Status & Features
  isVerified: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  }, 
  // Metrics
  totalEmployees: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
