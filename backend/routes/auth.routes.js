const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', authController.logout);
router.post('/logoutAll', authController.logoutAll);
router.get('/me', authController.getMe);

module.exports = router;
