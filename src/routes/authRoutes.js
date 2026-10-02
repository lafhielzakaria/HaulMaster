const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.profile);

router.get('/waiting-list', authenticateToken, authorize('auth:getWaitingList'), authController.getWaitingList);
router.patch('/users/:id/status', authenticateToken, authorize('auth:setUserActiveStatus'), authController.setUserActiveStatus);

module.exports = router;
