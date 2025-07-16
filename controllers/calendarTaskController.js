const CalendarTask = require('../models/calendarTask');
const User = require('../models/user');

// Helper function to check if user can assign tasks
const canAssignTasks = (user) => {
  return user.role === 'super_admin' || user.role === 'admin';
};

// Helper function to get accessible users for task assignment
const getAssignableUsers = async (currentUser) => {
  let query = { isActive: true };
  
  if (currentUser.role === 'super_admin') {
    // Super admin can assign to anyone
  } else if (currentUser.role === 'admin') {
    // Admin can assign to users in their region
    query.region = currentUser.region;
  } else {
    // Others cannot assign tasks
    return [];
  }
  
  return await User.find(query, 'firstName lastName email role region')
    .sort({ firstName: 1, lastName: 1 });
};

// Get tasks for current user based on role and permissions
const getTasks = async (req, res) => {
  try {
    const { startDate, endDate, status, type, assignedTo } = req.query;
    const currentUser = req.user;
    
    let tasks;
    
    if (currentUser.role === 'super_admin') {
      // Super admin sees all tasks
      let query = { isActive: true };
      
      // Apply filters
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }
      if (status) query.status = status;
      if (type) query.type = type;
      if (assignedTo) query.assignedTo = assignedTo;
      
      tasks = await CalendarTask.find(query)
        .populate('assignedTo', 'firstName lastName email role')
        .populate('assignedBy', 'firstName lastName email role')
        .populate('candidateId', 'firstName lastName email')
        .populate('companyId', 'name email')
        .populate('jobId', 'title company')
        .populate('projectId', 'name')
        .sort({ startDate: 1 });
        
    } else if (currentUser.role === 'admin') {
      // Admin sees tasks in their region
      let query = { 
        isActive: true, 
        region: currentUser.region 
      };
      
      // Apply filters
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }
      if (status) query.status = status;
      if (type) query.type = type;
      if (assignedTo) query.assignedTo = assignedTo;
      
      tasks = await CalendarTask.find(query)
        .populate('assignedTo', 'firstName lastName email role')
        .populate('assignedBy', 'firstName lastName email role')
        .populate('candidateId', 'firstName lastName email')
        .populate('companyId', 'name email')
        .populate('jobId', 'title company')
        .populate('projectId', 'name')
        .sort({ startDate: 1 });
        
    } else {
      // Regular users see only their assigned tasks
      let query = { 
        isActive: true, 
        assignedTo: currentUser._id,
        region: currentUser.region 
      };
      
      // Apply filters
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }
      if (status) query.status = status;
      if (type) query.type = type;
      
      tasks = await CalendarTask.find(query)
        .populate('assignedBy', 'firstName lastName email role')
        .populate('candidateId', 'firstName lastName email')
        .populate('companyId', 'name email')
        .populate('jobId', 'title company')
        .populate('projectId', 'name')
        .sort({ startDate: 1 });
    }
    
    res.json({
      tasks,
      canAssign: canAssignTasks(currentUser)
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUser = req.user;
    
    const task = await CalendarTask.findById(taskId)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email role')
      .populate('candidateId', 'firstName lastName email')
      .populate('companyId', 'name email')
      .populate('jobId', 'title company')
      .populate('projectId', 'name')
      .populate('notes.author', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user can access this task
    if (!task.canUserAccess(currentUser)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      task,
      canEdit: task.canUserEdit(currentUser),
      canAssign: canAssignTasks(currentUser)
    });
    
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new task (only admins and super-admins)
const createTask = async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Check permission
    if (!canAssignTasks(currentUser)) {
      return res.status(403).json({ message: 'Only administrators can assign tasks' });
    }
    
    const {
      title,
      description,
      type,
      priority,
      startDate,
      endDate,
      isAllDay,
      assignedTo,
      candidateId,
      companyId,
      jobId,
      projectId,
      location,
      color,
      reminders
    } = req.body;
    
    // Validate required fields
    if (!title || !startDate || !endDate || !assignedTo) {
      return res.status(400).json({ 
        message: 'Title, start date, end date, and assigned user are required' 
      });
    }
    
    // Validate assigned user exists and is accessible
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }
    
    // Check if current user can assign to this user
    if (currentUser.role === 'admin' && assignedUser.region !== currentUser.region) {
      return res.status(403).json({ 
        message: 'You can only assign tasks to users in your region' 
      });
    }
    
    // Create task
    const task = new CalendarTask({
      title,
      description,
      type: type || 'other',
      priority: priority || 'medium',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isAllDay: isAllDay || false,
      assignedTo,
      assignedBy: currentUser._id,
      candidateId,
      companyId,
      jobId,
      projectId,
      location,
      color: color || '#3B82F6',
      reminders: reminders || [],
      region: assignedUser.region
    });
    
    await task.save();
    
    // Populate and return
    const populatedTask = await CalendarTask.findById(task._id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email role')
      .populate('candidateId', 'firstName lastName email')
      .populate('companyId', 'name email')
      .populate('jobId', 'title company')
      .populate('projectId', 'name');
    
    res.status(201).json({
      task: populatedTask,
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUser = req.user;
    const updateData = req.body;
    
    const task = await CalendarTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user can edit this task
    if (!task.canUserEdit(currentUser)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Determine what user can update based on role
    const allowedUpdates = {};
    
    if (canAssignTasks(currentUser)) {
      // Admins can update everything
      Object.assign(allowedUpdates, updateData);
      
      // If reassigning, validate the new assigned user
      if (updateData.assignedTo && updateData.assignedTo !== task.assignedTo.toString()) {
        const newAssignedUser = await User.findById(updateData.assignedTo);
        if (!newAssignedUser) {
          return res.status(400).json({ message: 'Assigned user not found' });
        }
        
        if (currentUser.role === 'admin' && newAssignedUser.region !== currentUser.region) {
          return res.status(403).json({ 
            message: 'You can only assign tasks to users in your region' 
          });
        }
        
        allowedUpdates.region = newAssignedUser.region;
      }
    } else if (task.assignedTo.toString() === currentUser._id.toString()) {
      // Assigned users can update status, completion notes, and add notes
      const userAllowedFields = ['status', 'completionNotes'];
      userAllowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          allowedUpdates[field] = updateData[field];
        }
      });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Apply updates
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] !== undefined) {
        task[key] = allowedUpdates[key];
      }
    });
    
    await task.save();
    
    // Populate and return
    const updatedTask = await CalendarTask.findById(task._id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email role')
      .populate('candidateId', 'firstName lastName email')
      .populate('companyId', 'name email')
      .populate('jobId', 'title company')
      .populate('projectId', 'name')
      .populate('notes.author', 'firstName lastName email');
    
    res.json({
      task: updatedTask,
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete task (soft delete)
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUser = req.user;
    
    const task = await CalendarTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Only task creator or admins can delete
    if (!canAssignTasks(currentUser) && task.assignedBy.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Soft delete
    task.isActive = false;
    await task.save();
    
    res.json({ message: 'Task deleted successfully' });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add note to task
const addTaskNote = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUser = req.user;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const task = await CalendarTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user can access this task
    if (!task.canUserAccess(currentUser)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Add note
    task.notes.push({
      content: content.trim(),
      author: currentUser._id,
      createdAt: new Date()
    });
    
    await task.save();
    
    // Populate and return updated task
    const updatedTask = await CalendarTask.findById(task._id)
      .populate('notes.author', 'firstName lastName email');
    
    res.json({
      task: updatedTask,
      message: 'Note added successfully'
    });
    
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get assignable users for task creation/assignment
const getAssignableUsersController = async (req, res) => {
  try {
    const currentUser = req.user;
    
    if (!canAssignTasks(currentUser)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const users = await getAssignableUsers(currentUser);
    res.json({ users });
    
  } catch (error) {
    console.error('Get assignable users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get task statistics for dashboard
const getTaskStats = async (req, res) => {
  try {
    const currentUser = req.user;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    let query = { 
      isActive: true,
      startDate: { $gte: startDate }
    };
    
    // Apply role-based filtering
    if (currentUser.role === 'super_admin') {
      // See all tasks
    } else if (currentUser.role === 'admin') {
      query.region = currentUser.region;
    } else {
      query.assignedTo = currentUser._id;
    }
    
    const tasks = await CalendarTask.find(query);
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      overdue: tasks.filter(t => t.status !== 'completed' && t.endDate < new Date()).length,
      byType: {},
      byPriority: {}
    };
    
    // Group by type
    tasks.forEach(task => {
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
    });
    
    res.json({ stats });
    
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskNote,
  getAssignableUsersController,
  getTaskStats
}; 