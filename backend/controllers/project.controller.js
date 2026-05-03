const catchAsync = require('../utils/catchAsync');
const projectService = require('../services/project.service');

exports.createProject = catchAsync(async (req, res, next) => {
  const project = await projectService.createProject(req.body, req.user._id);
  res.status(201).json({ success: true, data: { project } });
});

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await projectService.getAllProjects(req.user._id, req.user.role);
  res.status(200).json({ success: true, data: { projects } });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await projectService.getProjectById(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ success: true, data: { project } });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, data: { project } });
});

exports.addMember = catchAsync(async (req, res, next) => {
  const project = await projectService.addMember(req.params.id, req.body.memberId, req.user._id);
  res.status(200).json({ success: true, data: { project } });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  await projectService.deleteProject(req.params.id);
  res.status(204).json({ success: true, data: null });
});
