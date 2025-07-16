const mongoose = require('mongoose');

const calendarTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['interview', 'followup', 'meeting', 'deadline', 'training', 'review', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timing
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Related entities
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // Additional details
  location: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  
  // Notifications and reminders
  reminders: [{
    time: {
      type: Number, // minutes before the event
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Comments/Notes
  notes: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Completion details
  completedAt: {
    type: Date
  },
  completionNotes: {
    type: String,
    trim: true
  },
  
  // Metadata
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    occurrences: Number
  },
  
  // Regional access
  region: {
    type: String,
    enum: ['montreal', 'dubai', 'turkey'],
    required: true,
    lowercase: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
calendarTaskSchema.index({ assignedTo: 1, startDate: 1 });
calendarTaskSchema.index({ assignedBy: 1, startDate: 1 });
calendarTaskSchema.index({ region: 1, startDate: 1 });
calendarTaskSchema.index({ status: 1, startDate: 1 });
calendarTaskSchema.index({ type: 1, startDate: 1 });

// Pre-save middleware to handle task completion
calendarTaskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.status !== 'completed' && this.completedAt) {
    this.completedAt = undefined;
  }
  next();
});

// Instance methods
calendarTaskSchema.methods.canUserAccess = function(user) {
  // Super admin can access all tasks
  if (user.role === 'super_admin') return true;
  
  // Admin can access tasks in their region
  if (user.role === 'admin') {
    return this.region === user.region;
  }
  
  // Consultants can view tasks assigned to them or by them in their region
  if (user.role === 'consultant') {
    return this.region === user.region && 
           (this.assignedTo.toString() === user._id.toString() || 
            this.assignedBy.toString() === user._id.toString());
  }
  
  // Employers can only view tasks assigned to them
  if (user.role === 'employer') {
    return this.assignedTo.toString() === user._id.toString();
  }
  
  return false;
};

calendarTaskSchema.methods.canUserEdit = function(user) {
  // Super admin can edit all tasks
  if (user.role === 'super_admin') return true;
  
  // Admin can edit tasks in their region
  if (user.role === 'admin') {
    return this.region === user.region;
  }
  
  // Task creator can edit their own tasks
  if (this.assignedBy.toString() === user._id.toString()) {
    return true;
  }
  
  // Assigned user can update status and add notes
  if (this.assignedTo.toString() === user._id.toString()) {
    return true;
  }
  
  return false;
};

calendarTaskSchema.methods.canUserAssign = function(user) {
  // Only super admin and admin can assign tasks
  return user.role === 'super_admin' || user.role === 'admin';
};

// Static methods
calendarTaskSchema.statics.getTasksForUser = function(user, startDate, endDate) {
  const query = { isActive: true };
  
  // Date range filter
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = startDate;
    if (endDate) query.startDate.$lte = endDate;
  }
  
  // Role-based filtering
  if (user.role === 'super_admin') {
    // Super admin sees all tasks
  } else if (user.role === 'admin') {
    // Admin sees tasks in their region
    query.region = user.region;
  } else {
    // Others see only their assigned tasks
    query.assignedTo = user._id;
    query.region = user.region;
  }
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email role')
    .populate('assignedBy', 'firstName lastName email role')
    .populate('candidateId', 'firstName lastName email')
    .populate('companyId', 'name email')
    .populate('jobId', 'title company')
    .populate('projectId', 'name')
    .populate('notes.author', 'firstName lastName')
    .sort({ startDate: 1 });
};

const CalendarTask = mongoose.model('CalendarTask', calendarTaskSchema);

module.exports = CalendarTask; 