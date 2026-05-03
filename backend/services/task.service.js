const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

exports.createTask = async (taskData, userId) => {
  const task = await Task.create({ ...taskData, createdBy: userId });

  await ActivityLog.create({
    actionType: 'TASK_CREATED',
    performedBy: userId,
    targetTask: task._id,
    targetProject: task.project,
    metadata: { title: task.title }
  });

  return task;
};

exports.getAllTasks = async (queryObj, userId, role) => {
  // Advanced filtering & pagination using Mongoose
  const query = { ...queryObj };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete query[el]);

  // RBAC: If member, only see tasks assigned to them (or within projects they are part of - depending on business logic. Let's say members see tasks in their projects)
  if (role !== 'Admin') {
    query.assignedTo = userId;
  }

  let mongooseQuery = Task.find(query).populate('assignedTo', 'username email').populate('project', 'title');

  // Sorting
  if (queryObj.sort) {
    const sortBy = queryObj.sort.split(',').join(' ');
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort('-createdAt');
  }

  // Pagination
  const page = queryObj.page * 1 || 1;
  const limit = queryObj.limit * 1 || 100;
  const skip = (page - 1) * limit;

  mongooseQuery = mongooseQuery.skip(skip).limit(limit).lean();

  return await mongooseQuery;
};

exports.getTaskById = async (taskId, userId, role) => {
  const task = await Task.findById(taskId).populate('assignedTo', 'username').populate('project', 'title');
  if (!task) throw new AppError('No task found', 404);

  if (role !== 'Admin' && task.assignedTo?._id.toString() !== userId.toString()) {
     throw new AppError('You do not have access to this task', 403);
  }

  return task;
};

exports.updateTask = async (taskId, updateData, userId, role) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('No task found', 404);

  // RBAC: Members can only update status
  if (role !== 'Admin') {
    const allowedUpdates = ['status'];
    const requestedUpdates = Object.keys(updateData);
    const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation || task.assignedTo?.toString() !== userId.toString()) {
      throw new AppError('You only have permission to update your task status', 403);
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true });

  await ActivityLog.create({
    actionType: 'TASK_UPDATED',
    performedBy: userId,
    targetTask: updatedTask._id,
    targetProject: updatedTask.project,
    metadata: { updatedFields: Object.keys(updateData) }
  });

  return updatedTask;
};

exports.deleteTask = async (taskId, userId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new AppError('No task found', 404);

  await ActivityLog.create({
    actionType: 'TASK_DELETED',
    performedBy: userId,
    targetProject: task.project,
    metadata: { title: task.title }
  });

  return task;
};
