const { assignTrip, reassignTrip, startTrip, completeTrip } = require('../services/tripService');

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

module.exports = { assignTripHandler, reassignTripHandler, startTripHandler, completeTripHandler };
