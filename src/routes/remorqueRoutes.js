const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/remorqueController');

router.get('/',       authenticateToken, getAll);
router.get('/:id',    authenticateToken, getOne);
router.post('/',      authenticateToken, authorizeRole('admin'), create);
router.put('/:id',    authenticateToken, authorizeRole('admin'), update);
router.delete('/:id', authenticateToken, authorizeRole('admin'), remove);

module.exports = router;
