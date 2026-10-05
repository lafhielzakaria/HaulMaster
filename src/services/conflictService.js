const Trajet = require('../models/Trajet');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
const Pneu = require('../models/Pneu');
const User = require('../models/User');

async function checkResourceAvailability(driver, camion, remorque, plannedStart, plannedEnd, excludeTripId = null) {
    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);

    if (end <= start) {
        throw Object.assign(new Error('Planned end date must be after planned start date'), { statusCode: 400 });
    }

    const driverDoc = await User.findById(driver);
    if (!driverDoc) {
        throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
    }
    if (driverDoc.status === 'suspended') {
        throw Object.assign(new Error('Driver is suspended'), { statusCode: 409 });
    }
    if (driverDoc.status !== 'active') {
        throw Object.assign(new Error('Driver is not active'), { statusCode: 409 });
    }

    const camionDoc = await Camion.findById(camion);
    if (!camionDoc) {
        throw Object.assign(new Error('Truck not found'), { statusCode: 404 });
    }
    if (camionDoc.statut === 'maintenance') {
        throw Object.assign(new Error('Truck is under maintenance'), { statusCode: 409 });
    }
    if (camionDoc.statut !== 'active') {
        throw Object.assign(new Error('Truck is not active'), { statusCode: 409 });
    }
    if (camionDoc.maintenanceAlert === 'PENDING') {
        throw Object.assign(new Error('Truck has an unresolved maintenance alert'), { statusCode: 409 });
    }

    const overLimitTire = await Pneu.findOne({ camion, $expr: { $gt: ['$kilometrage', '$kilometrageMax'] } });
    if (overLimitTire) {
        throw Object.assign(new Error('Truck has a tire exceeding its mileage limit'), { statusCode: 409 });
    }

    const remorqueDoc = await Remorque.findById(remorque);
    if (!remorqueDoc) {
        throw Object.assign(new Error('Trailer not found'), { statusCode: 404 });
    }
    if (remorqueDoc.statut === 'maintenance') {
        throw Object.assign(new Error('Trailer is under maintenance'), { statusCode: 409 });
    }
    if (remorqueDoc.statut !== 'active') {
        throw Object.assign(new Error('Trailer is not active'), { statusCode: 409 });
    }
    if (remorqueDoc.maintenanceAlert === 'PENDING') {
        throw Object.assign(new Error('Trailer has an unresolved maintenance alert'), { statusCode: 409 });
    }

    const overlapCondition = { plannedStart: { $lt: end }, plannedEnd: { $gt: start } };
    const baseQuery = {
        status: { $nin: ['COMPLETED', 'CANCELED'] },
        $or: [
            { driver, ...overlapCondition },
            { camion, ...overlapCondition },
            { remorque, ...overlapCondition }
        ]
    };

    if (excludeTripId) baseQuery._id = { $ne: excludeTripId };

    const conflict = await Trajet.findOne(baseQuery);
    if (conflict) {
        throw Object.assign(new Error('Resource already booked during this period'), { statusCode: 409 });
    }
}

module.exports = { checkResourceAvailability };
