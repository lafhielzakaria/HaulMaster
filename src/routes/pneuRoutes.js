const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/pneuController');
const validate = require('../validations/validate');
const pneuSchemas = require('../validations/schemas/pneuSchemas');

/**
 * @swagger
 * tags:
 *   name: Pneus
 *   description: Pneu management (Admin only)
 */

/**
 * @swagger
 * /api/pneu:
 *   get:
 *     summary: Get all pneus
 *     tags: [Pneus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pneus
 */
router.get('/', authenticateToken, authorize('fleet:read'), getAll);

/**
 * @swagger
 * /api/pneu/{id}:
 *   get:
 *     summary: Get a pneu by ID
 *     tags: [Pneus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pneu found
 *       404:
 *         description: Pneu not found
 */
router.get('/:id', authenticateToken, authorize('fleet:read'), getOne);

/**
 * @swagger
 * /api/pneu:
 *   post:
 *     summary: Create a new pneu (Admin)
 *     tags: [Pneus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [marque, taille, type]
 *             properties:
 *               marque:
 *                 type: string
 *               taille:
 *                 type: string
 *               type:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [active, inactive, out_of_service]
 *               camion:
 *                 type: string
 *                 description: Camion ID (optional)
 *     responses:
 *       201:
 *         description: Pneu created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, authorize('fleet:write'), validate(pneuSchemas.create), create);

/**
 * @swagger
 * /api/pneu/{id}:
 *   put:
 *     summary: Update a pneu (Admin)
 *     tags: [Pneus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marque:
 *                 type: string
 *               taille:
 *                 type: string
 *               type:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [active, inactive, out_of_service]
 *               camion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pneu updated
 *       404:
 *         description: Pneu not found
 */
router.put('/:id', authenticateToken, authorize('fleet:write'), validate(pneuSchemas.update), update);

/**
 * @swagger
 * /api/pneu/{id}:
 *   delete:
 *     summary: Delete a pneu (Admin)
 *     tags: [Pneus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pneu deleted
 *       404:
 *         description: Pneu not found
 */
router.delete('/:id', authenticateToken, authorize('fleet:write'), remove);

module.exports = router;
