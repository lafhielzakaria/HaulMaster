const express = require('express');
const router  = express.Router();
const authenticateToken = require('../../middlewares/authMiddleware');
const { authorize }    = require('../../middlewares/roleMiddleware');
const {
    ecoPerformanceHandler,
    tireHealthMatrixHandler,
    financialEsgHandler,
    fleetUtilizationTrendsHandler,
} = require('../../controllers/v2/analyticsController');

router.use(authenticateToken);

router.get('/drivers/eco-performance',  authorize('analytics:read'), ecoPerformanceHandler);
router.get('/tires/health-matrix',      authorize('analytics:read'), tireHealthMatrixHandler);
router.get('/trips/financial-esg',      authorize('analytics:read'), financialEsgHandler);
router.get('/fleet/utilization-trends', authorize('analytics:read'), fleetUtilizationTrendsHandler);

module.exports = router;
