const trajetRepository = require('../repositories/trajetRepository');
const camionRepository = require('../repositories/camionRepository');
const remorqueRepository = require('../repositories/remorqueRepository');
const pneuRepository = require('../repositories/pneuRepository');
const userRepository = require('../repositories/userRepository');

async function checkResourceAvailability(driver, camion, remorque, plannedStart, plannedEnd, excludeTripId = null) {
    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);

    if (end <= start) {
        throw Object.assign(new Error('Planned end date must be after planned start date'), { statusCode: 400 });
    }

    const driverDoc = await userRepository.findById(driver);
    if (!driverDoc) throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
    if (driverDoc.status === 'suspended') throw Object.assign(new Error('Driver is suspended'), { statusCode: 409 });
    if (driverDoc.status !== 'active') throw Object.assign(new Error('Driver is not active'), { statusCode: 409 });

    const activeTrip = await trajetRepository.findConflict({
        driver,
        status: { $in: ['TODO', 'IN_PROGRESS'] },
        ...(excludeTripId ? { _id: { $ne: excludeTripId } } : {}),
    });
    if (activeTrip) throw Object.assign(new Error('Driver already has an active trip'), { statusCode: 409 });

    const camionDoc = await camionRepository.findById(camion);
    if (!camionDoc) throw Object.assign(new Error('Truck not found'), { statusCode: 404 });
    if (camionDoc.statut === 'maintenance') throw Object.assign(new Error('Truck is under maintenance'), { statusCode: 409 });
    if (camionDoc.statut !== 'active') throw Object.assign(new Error('Truck is not active'), { statusCode: 409 });
    if (camionDoc.maintenanceAlert === 'PENDING') throw Object.assign(new Error('Truck has an unresolved maintenance alert'), { statusCode: 409 });

    const overLimitTire = await pneuRepository.findOverLimitByCamion(camion);
    if (overLimitTire) throw Object.assign(new Error('Truck has a tire exceeding its mileage limit'), { statusCode: 409 });

    const tireNearLimit = await pneuRepository.findNearLimitByCamion(camion);
    if (tireNearLimit) throw Object.assign(new Error('Truck has a tire with no remaining mileage capacity'), { statusCode: 409 });

    const remorqueDoc = await remorqueRepository.findById(remorque);
    if (!remorqueDoc) throw Object.assign(new Error('Trailer not found'), { statusCode: 404 });
    if (remorqueDoc.statut === 'maintenance') throw Object.assign(new Error('Trailer is under maintenance'), { statusCode: 409 });
    if (remorqueDoc.statut !== 'active') throw Object.assign(new Error('Trailer is not active'), { statusCode: 409 });
    if (remorqueDoc.maintenanceAlert === 'PENDING') throw Object.assign(new Error('Trailer has an unresolved maintenance alert'), { statusCode: 409 });

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

    const conflict = await trajetRepository.findConflict(baseQuery);
    if (conflict) throw Object.assign(new Error('Resource already booked during this period'), { statusCode: 409 });
}

module.exports = { checkResourceAvailability };
