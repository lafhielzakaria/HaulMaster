const express = require('express');
const router = express.Router();
const { assignTripHandler, reassignTripHandler } = require('../controllers/tripController');
const { getAllTripsHandler, startTripHandler, completeTripHandler, makePdfHandler } = require('../controllers/shared/tripHandlers');
const authenticateToken = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../validations/validate');
const tripSchemas = require('../validations/schemas/tripSchemas');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management
 */

/**
 * @swagger
 * /api/trips/driver/{id}/pdf/local:
 *   get:
 *     summary: Generate PDF and save locally
 *     tags: [Trips]
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
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Driver not found
 */
router.get('/driver/:id/pdf/local', authenticateToken, authorize('trip:own'), makePdfHandler('local'));

/**
 * @swagger
 * /api/trips/driver/{id}/pdf/minio:
 *   get:
 *     summary: Generate PDF and save to MinIO
 *     tags: [Trips]
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
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Driver not found
 */
router.get('/driver/:id/pdf/minio', authenticateToken, authorize('trip:own'), makePdfHandler('minio'));

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips (Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get('/', authenticateToken, authorize('trip:read'), getAllTripsHandler);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Assign a new trip (Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departureSite, arrivalSite, plannedStart, plannedEnd, driver, camion, remorque]
 *             properties:
 *               departureSite:
 *                 type: string
 *               arrivalSite:
 *                 type: string
 *               plannedStart:
 *                 type: string
 *                 format: date-time
 *               plannedEnd:
 *                 type: string
 *                 format: date-time
 *               driver:
 *                 type: string
 *               camion:
 *                 type: string
 *               remorque:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip assigned
 *       409:
 *         description: Conflict
 */
router.post('/', authenticateToken, authorize('trip:write'), validate(tripSchemas.assign), assignTripHandler);

/**
 * @swagger
 * /api/trips/{id}/reassign:
 *   patch:
 *     summary: Reassign a trip (Admin)
 *     tags: [Trips]
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
 *         description: Trip reassigned
 *       409:
 *         description: Conflict
 */
router.patch('/:id/reassign', authenticateToken, authorize('trip:write'), reassignTripHandler);

/**
 * @swagger
 * /api/trips/{id}/start:
 *   patch:
 *     summary: Start a trip (Driver)
 *     tags: [Trips]
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
 *             required: [startMileage]
 *             properties:
 *               startMileage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trip started
 */
router.patch('/:id/start', authenticateToken, startTripHandler);

/**
 * @swagger
 * /api/trips/{id}/complete:
 *   patch:
 *     summary: Complete a trip (Driver)
 *     tags: [Trips]
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
 *             required: [endMileage, fuelConsumed, fuelCost]
 *             properties:
 *               endMileage:
 *                 type: number
 *               fuelConsumed:
 *                 type: number
 *               fuelCost:
 *                 type: number
 *               driverRemarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip completed
 */
router.patch('/:id/complete', authenticateToken, completeTripHandler);

module.exports = router;
