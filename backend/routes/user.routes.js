const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('Admin'), userController.getAllUsers);

module.exports = router;
