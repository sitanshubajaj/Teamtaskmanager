const express = require('express');
const projectController = require('../controllers/project.controller');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const taskRouter = require('./task.routes');

const router = express.Router();

// Mount task router to get tasks for a specific project
router.use('/:projectId/tasks', taskRouter);

router.use(protect);

router.route('/')
  .get(projectController.getAllProjects)
  .post(restrictTo('Admin'), projectController.createProject);

router.route('/:id')
  .get(projectController.getProject)
  .patch(restrictTo('Admin'), projectController.updateProject)
  .delete(restrictTo('Admin'), projectController.deleteProject);

router.route('/:id/members')
  .post(restrictTo('Admin'), projectController.addMember);

module.exports = router;
