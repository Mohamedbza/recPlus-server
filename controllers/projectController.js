const Project = require('../models/project');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority, teamMember } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Priority filter
    if (priority) {
      query.priority = priority;
    }
    
    // Team member filter
    if (teamMember) {
      query['teamMembers.userId'] = teamMember;
    }
    
    const projects = await Project.find(query)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers.userId', 'firstName lastName email role')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email industry')
      .populate('tasks.assignedTo', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const newProject = await project.save();
    
    // Populate the created project
    const populatedProject = await Project.findById(newProject._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('teamMembers.userId', 'firstName lastName email')
    .populate('projectManager', 'firstName lastName email')
    .populate('company', 'name email')
    .populate('tasks.assignedTo', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects by team member
const getProjectsByTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({
      'teamMembers.userId': userId
    })
    .populate('teamMembers.userId', 'firstName lastName email')
    .populate('projectManager', 'firstName lastName email')
    .populate('company', 'name email')
    .populate('tasks.assignedTo', 'firstName lastName email');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects by status
const getProjectsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const projects = await Project.find({ status })
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project progress
const updateProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true, runValidators: true }
    )
    .populate('teamMembers.userId', 'firstName lastName email')
    .populate('projectManager', 'firstName lastName email')
    .populate('company', 'name email')
    .populate('tasks.assignedTo', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add team member to project
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is already a team member
    const existingMember = project.teamMembers.find(
      member => member.userId.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }
    
    project.teamMembers.push({ userId, role });
    await project.save();
    
    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');
    
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove team member from project
const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.teamMembers = project.teamMembers.filter(
      member => member.userId.toString() !== userId
    );
    
    await project.save();
    
    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');
    
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add task to project
const addTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, startDate, dueDate, estimatedHours, tags } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newTask = {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      startDate,
      dueDate,
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      tags: tags || [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.tasks.push(newTask);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskIndex = project.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        project.tasks[taskIndex][key] = updateData[key];
      }
    });

    // Update timestamp
    project.tasks[taskIndex].updatedAt = new Date();

    // If task is completed, set completed date
    if (updateData.status === 'completed' && !project.tasks[taskIndex].completedDate) {
      project.tasks[taskIndex].completedDate = new Date();
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.tasks = project.tasks.filter(task => task._id.toString() !== taskId);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('teamMembers.userId', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email')
      .populate('company', 'name email')
      .populate('tasks.assignedTo', 'firstName lastName email');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get tasks by assignee
const getTasksByAssignee = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const projects = await Project.find({
      'tasks.assignedTo': userId
    })
    .populate('tasks.assignedTo', 'firstName lastName email');

    const tasks = [];
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedTo && task.assignedTo.toString() === userId) {
          tasks.push({
            ...task.toObject(),
            projectId: project._id,
            projectName: project.name
          });
        }
      });
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByTeamMember,
  getProjectsByStatus,
  updateProjectProgress,
  addTeamMember,
  removeTeamMember,
  addTask,
  updateTask,
  deleteTask,
  getTasksByAssignee
}; 