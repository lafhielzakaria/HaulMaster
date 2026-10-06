const express = require('express');
const router = express.Router();
const { assignTripHandler, reassignTripHandler, startTripHandler, completeTripHandler, getAllTripsHandler } = require('../controllers/tripController');
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../validations/validate');
const tripSchemas = require('../validations/schemas/tripSchemas');

router.get('/', authenticateToken, authorize('trip:read'), getAllTripsHandler);

router.post('/', authenticateToken, authorize('trip:write'), validate(tripSchemas.assign), assignTripHandler);
router.patch('/:id/reassign', authenticateToken, authorize('trip:write'), reassignTripHandler);

// Driver
router.patch('/:id/start', authenticateToken, startTripHandler);
router.patch('/:id/complete', authenticateToken, completeTripHandler);

module.exports = router;
