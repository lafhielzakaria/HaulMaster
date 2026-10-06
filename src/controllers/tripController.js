const { assignTrip, reassignTrip, startTrip, completeTrip } = require('../services/tripService');
const Trajet = require('../models/Trajet');

async function getAllTripsHandler(req, res, next) {
    try {
        const trips = await Trajet.find()
            .populate('driver', 'email')
            .populate('camion', 'matricule marque modele')
            .populate('remorque', 'matricule');
        return res.json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
}

async function assignTripHandler(req, res, next) {
    try {
        const { departureSite, arrivalSite, plannedStart, plannedEnd, driver, camion, remorque } = req.body;
        const trip = await assignTrip({ departureSite, arrivalSite, plannedStart, plannedEnd, driver, camion, remorque });
        return res.status(201).json({ success: true, data: trip });
    } catch (error) {
        next(error);
    }
}

async function reassignTripHandler(req, res, next) {
    try {
        const trip = await reassignTrip(req.params.id, req.body);
        return res.status(200).json({ success: true, data: trip });
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

module.exports = { assignTripHandler, reassignTripHandler, startTripHandler, completeTripHandler, getAllTripsHandler };
