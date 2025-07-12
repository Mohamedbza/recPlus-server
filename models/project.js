const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    enum: ['montreal', 'dubai', 'turkey'],
    trim: true
  },
  
  // Team members - references to User model
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['project-manager', 'developer', 'designer', 'tester', 'analyst', 'other'],
      default: 'developer'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Project tasks
  tasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      default: 0
    },
    actualHours: {
      type: Number,
      default: 0
    },
    tags: [String],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project.tasks'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Project manager
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Company/Client
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Technologies/Skills used
  technologies: [String],
  
  // Project type
  type: {
    type: String,
    enum: ['web-development', 'mobile-app', 'desktop-app', 'api-development', 'consulting', 'maintenance', 'other'],
    default: 'web-development'
  },
  
  // Progress percentage
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Project documents/files
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ 'teamMembers.userId': 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ company: 1 });
projectSchema.index({ 'tasks.assignedTo': 1 });
projectSchema.index({ 'tasks.status': 1 });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project; 