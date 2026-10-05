const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.profile);

router.get('/waiting-list', authenticateToken, authorizeRole('admin'), authController.getWaitingList);
router.patch('/users/:id/status', authenticateToken, authorizeRole('admin'), authController.setUserActiveStatus);

module.exports = router;
