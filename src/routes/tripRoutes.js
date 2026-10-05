const express = require('express');
const router = express.Router();
const { assignTripHandler, reassignTripHandler, startTripHandler, completeTripHandler } = require('../controllers/tripController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Admin only
router.post('/', authenticateToken, authorizeRole('admin'), assignTripHandler);
router.patch('/:id/reassign', authenticateToken, authorizeRole('admin'), reassignTripHandler);

// Driver
router.patch('/:id/start', authenticateToken, startTripHandler);
router.patch('/:id/complete', authenticateToken, completeTripHandler);

module.exports = router;
