const { startTrip, completeTrip } = require('../../services/tripService');
const trajetRepository = require('../../repositories/trajetRepository');
const userRepository = require('../../repositories/userRepository');
const { generateDriverTripsPdf } = require('../../services/pdfService');

async function getAllTripsHandler(req, res, next) {
    try {
        const trips = await trajetRepository.findAll();
        return res.json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
}

async function startTripHandler(req, res, next) {
    try {
        const trip = await startTrip(req.params.id, req.body.startMileage, req.user.userId);
        return res.status(200).json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
}

async function completeTripHandler(req, res, next) {
    try {
        const { endMileage, fuelConsumed, fuelCost, driverRemarks } = req.body;
        const trip = await completeTrip(req.params.id, { endMileage, fuelConsumed, fuelCost, driverRemarks }, req.user.userId);
        return res.status(200).json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
}

function makePdfHandler(save) {
    return async function (req, res, next) {
        try {
            const requestedId = req.params.id;
            const { userId, role } = req.user;
            if (role === 'driver' && userId !== requestedId) {
                return res.status(403).json({ message: 'Access denied. You can only generate your own PDF.' });
            }
            const driver = await userRepository.findByIdExcludePassword(requestedId);
            if (!driver) return res.status(404).json({ message: 'Driver not found' });
            const trips = await trajetRepository.findByDriverActive(requestedId);
            await generateDriverTripsPdf(driver, trips, res, save);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { getAllTripsHandler, startTripHandler, completeTripHandler, makePdfHandler };
