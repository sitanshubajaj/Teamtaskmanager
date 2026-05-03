const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');

exports.createTask = catchAsync(async (req, res, next) => {
  if (!req.body.project) req.body.project = req.params.projectId; // Allow nested routes
  
  const task = await taskService.createTask(req.body, req.user._id);
  res.status(201).json({ success: true, data: { task } });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.projectId) filter = { project: req.params.projectId };
  
  const queryObj = { ...filter, ...req.query };
  const tasks = await taskService.getAllTasks(queryObj, req.user._id, req.user.role);
  
  res.status(200).json({ success: true, results: tasks.length, data: { tasks } });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ success: true, data: { task } });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user._id, req.user.role);
  res.status(200).json({ success: true, data: { task } });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  await taskService.deleteTask(req.params.id, req.user._id);
  res.status(204).json({ success: true, data: null });
});
