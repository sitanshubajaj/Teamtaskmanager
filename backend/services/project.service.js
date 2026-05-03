const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

exports.createProject = async (projectData, userId) => {
  const project = await Project.create({ ...projectData, createdBy: userId });

  await ActivityLog.create({
    actionType: 'PROJECT_CREATED',
    performedBy: userId,
    targetProject: project._id,
    metadata: { title: project.title }
  });

  return project;
};

exports.getAllProjects = async (userId, role) => {
  let query = {};
  if (role !== 'Admin') {
    // Member can only see projects they are a member of
    query = { members: userId };
  }
  return await Project.find(query).populate('members', 'username email').lean();
};

exports.getProjectById = async (projectId, userId, role) => {
  const project = await Project.findById(projectId).populate('members', 'username email');
  
  if (!project) {
    throw new AppError('No project found with that ID', 404);
  }

  // RBAC: If member, must be in the members array
  if (role !== 'Admin') {
    const isMember = project.members.some(m => m._id.toString() === userId.toString());
    if (!isMember) {
      throw new AppError('You do not have access to this project', 403);
    }
  }

  return project;
};

exports.updateProject = async (projectId, updateData, userId) => {
  const project = await Project.findByIdAndUpdate(projectId, updateData, {
    new: true,
    runValidators: true
  });

  if (!project) {
    throw new AppError('No project found with that ID', 404);
  }

  await ActivityLog.create({
    actionType: 'PROJECT_UPDATED',
    performedBy: userId,
    targetProject: project._id,
    metadata: { updatedFields: Object.keys(updateData) }
  });

  return project;
};

exports.addMember = async (projectId, memberId, userId) => {
  const project = await Project.findByIdAndUpdate(
    projectId, 
    { $addToSet: { members: memberId } },
    { new: true }
  );

  if (!project) throw new AppError('No project found', 404);

  await ActivityLog.create({
    actionType: 'MEMBER_ADDED',
    performedBy: userId,
    targetProject: project._id,
    metadata: { memberAdded: memberId }
  });

  return project;
};

exports.deleteProject = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) throw new AppError('No project found', 404);
  return project;
};
