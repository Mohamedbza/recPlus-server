const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  address: { 
    type: String, 
    required: true,
    trim: true 
  },
  website: { 
    type: String,
    trim: true 
  },
  
  // Company Details
  industry: { 
    type: String, 
    required: true,
    trim: true 
  },
  companySize: { 
    type: String, 
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    default: 'small' 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  founded: { 
    type: String,
    trim: true 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active' 
  },
  
  // Media
  logo: { 
    type: String,
    default: '/api/placeholder/100/100' 
  },
  
  // Additional fields from frontend types
  location: { 
    type: String,
    trim: true 
  },
  city: { 
    type: String,
    trim: true 
  },
  country: { 
    type: String,
    trim: true 
  },
  postalCode: { 
    type: String,
    trim: true 
  },
  foundedYear: { 
    type: Number,
    min: 1800 
  },
  registrationNumber: { 
    type: String,
    trim: true 
  },
  taxId: { 
    type: String,
    trim: true 
  },
  logoUrl: { 
    type: String,
    trim: true 
  },
  coverImageUrl: { 
    type: String,
    trim: true 
  },
  socialMedia: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true }
  },
  
  // Verification and Premium status
  isVerified: { 
    type: Boolean,
    default: false 
  },
  isPremium: { 
    type: Boolean,
    default: false 
  },
  
  // Metrics
  totalEmployees: { 
    type: Number,
    default: 0,
    min: 0 
  },
  activeJobs: { 
    type: Number,
    default: 0,
    min: 0 
  },
  notes: { 
    type: String,
    trim: true 
  },
  
  // Timestamps
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
  timestamps: { 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt' 
  }
});
 

// Check if model already exists to prevent duplicate compilation
const Company = mongoose.model('Company', companySchema);

module.exports = Company;