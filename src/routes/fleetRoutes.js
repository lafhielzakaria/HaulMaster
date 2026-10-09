const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getAll, getOne, create, update, remove, setStatus } = require('../controllers/fleetController');
const validate = require('../validations/validate');
const camionSchemas = require('../validations/schemas/camionSchemas');

/**
 * @swagger
 * tags:
 *   name: Camions
 *   description: Camion management (Admin only)
 */

/**
 * @swagger
 * /api/fleet:
 *   get:
 *     summary: Get all camions, optionally filtered by statut
 *     tags: [Camions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [active, inactive, out_of_service]
 *         description: Filter camions by statut
 *     responses:
 *       200:
 *         description: List of camions
 */
router.get('/', authenticateToken, authorize('fleet:read'), getAll);

/**
 * @swagger
 * /api/fleet/{id}:
 *   get:
 *     summary: Get a camion by ID
 *     tags: [Camions]
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
 *         description: Camion found
 *       404:
 *         description: Camion not found
 */
router.get('/:id', authenticateToken, authorize('fleet:read'), getOne);

/**
 * @swagger
 * /api/fleet:
 *   post:
 *     summary: Create a new camion (Admin)
 *     tags: [Camions]
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
 *         description: Camion created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, authorize('fleet:write'), validate(camionSchemas.create), create);

/**
 * @swagger
 * /api/fleet/{id}:
 *   put:
 *     summary: Update a camion (Admin)
 *     tags: [Camions]
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
 *         description: Camion updated
 *       404:
 *         description: Camion not found
 */
router.put('/:id', authenticateToken, authorize('fleet:write'), validate(camionSchemas.update), update);

/**
 * @swagger
 * /api/fleet/{id}:
 *   delete:
 *     summary: Delete a camion (Admin)
 *     tags: [Camions]
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
 *         description: Camion deleted
 *       404:
 *         description: Camion not found
 */
router.delete('/:id', authenticateToken, authorize('fleet:write'), remove);

/**
 * @swagger
 * /api/fleet/{id}/status:
 *   patch:
 *     summary: Update camion status (Admin)
 *     tags: [Camions]
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
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [active, inactive, out_of_service, maintenance]
 *     responses:
 *       200:
 *         description: Camion status updated
 *       400:
 *         description: Invalid statut or already set
 *       404:
 *         description: Camion not found
 */
router.patch('/:id/status', authenticateToken, authorize('fleet:write'), setStatus);

module.exports = router;
