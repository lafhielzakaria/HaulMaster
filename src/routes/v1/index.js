const express = require('express');
const router = express.Router();

router.use('/auth',      require('../authRoutes'));
router.use('/fleet',     require('../fleetRoutes'));
router.use('/pneu',      require('../pneuRoutes'));
router.use('/remorques', require('../remorqueRoutes'));
router.use('/trips',     require('./tripRoutes'));

module.exports = router;
