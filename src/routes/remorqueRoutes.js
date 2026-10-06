const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/remorqueController');

router.get('/',       authenticateToken, authorize('fleet:read'),  getAll);
router.get('/:id',    authenticateToken, authorize('fleet:read'),  getOne);
router.post('/',      authenticateToken, authorize('fleet:write'), create);
router.put('/:id',    authenticateToken, authorize('fleet:write'), update);
router.delete('/:id', authenticateToken, authorize('fleet:write'), remove);

module.exports = router;
