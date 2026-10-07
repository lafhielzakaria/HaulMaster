const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/remorqueController');

/**
 * @swagger
 * tags:
 *   name: Remorques
 *   description: Remorque management (Admin only)
 */

/**
 * @swagger
 * /api/remorques:
 *   get:
 *     summary: Get all remorques
 *     tags: [Remorques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of remorques
 */
router.get('/', authenticateToken, authorize('fleet:read'), getAll);

/**
 * @swagger
 * /api/remorques/{id}:
 *   get:
 *     summary: Get a remorque by ID
 *     tags: [Remorques]
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
 *         description: Remorque found
 *       404:
 *         description: Remorque not found
 */
router.get('/:id', authenticateToken, authorize('fleet:read'), getOne);

/**
 * @swagger
 * /api/remorques:
 *   post:
 *     summary: Create a new remorque (Admin)
 *     tags: [Remorques]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matricule, marque, modele, annee, capacite]
 *             properties:
 *               matricule:
 *                 type: string
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               annee:
 *                 type: integer
 *               capacite:
 *                 type: number
 *               statut:
 *                 type: string
 *                 enum: [active, inactive, out_of_service]
 *     responses:
 *       201:
 *         description: Remorque created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, authorize('fleet:write'), create);

/**
 * @swagger
 * /api/remorques/{id}:
 *   put:
 *     summary: Update a remorque (Admin)
 *     tags: [Remorques]
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
 *               matricule:
 *                 type: string
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               annee:
 *                 type: integer
 *               capacite:
 *                 type: number
 *               statut:
 *                 type: string
 *                 enum: [active, inactive, out_of_service]
 *     responses:
 *       200:
 *         description: Remorque updated
 *       404:
 *         description: Remorque not found
 */
router.put('/:id', authenticateToken, authorize('fleet:write'), update);

/**
 * @swagger
 * /api/remorques/{id}:
 *   delete:
 *     summary: Delete a remorque (Admin)
 *     tags: [Remorques]
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
 *         description: Remorque deleted
 *       404:
 *         description: Remorque not found
 */
router.delete('/:id', authenticateToken, authorize('fleet:write'), remove);

module.exports = router;
