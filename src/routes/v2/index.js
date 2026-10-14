const express = require('express');
const router = express.Router();

router.use('/auth',      require('../shared/authRoutes'));
router.use('/fleet',     require('../shared/fleetRoutes'));
router.use('/pneu',      require('../shared/pneuRoutes'));
router.use('/remorques', require('../shared/remorqueRoutes'));
router.use('/trips',     require('./tripRoutes'));

module.exports = router;
