const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/pneuController');
const validate = require('../validations/validate');
const pneuSchemas = require('../validations/schemas/pneuSchemas');

router.get('/',       authenticateToken, authorize('fleet:read'),  getAll);
router.get('/:id',    authenticateToken, authorize('fleet:read'),  getOne);
router.post('/',      authenticateToken, authorize('fleet:write'), validate(pneuSchemas.create), create);
router.put('/:id',    authenticateToken, authorize('fleet:write'), validate(pneuSchemas.update), update);
router.delete('/:id', authenticateToken, authorize('fleet:write'), remove);

module.exports = router;
