const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // Important for nested routes

router.use(protect);

router.route('/')
  .get(taskController.getAllTasks)
  .post(restrictTo('Admin'), taskController.createTask);

router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask) // RBAC handled in service
  .delete(restrictTo('Admin'), taskController.deleteTask);

module.exports = router;
