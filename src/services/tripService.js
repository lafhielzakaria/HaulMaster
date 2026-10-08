const trajetRepository = require('../repositories/trajetRepository');
const { checkResourceAvailability } = require('./conflictService');

async function assignTrip(data) {
    const { departureSite, arrivalSite, plannedStart, plannedEnd, driver, camion, remorque } = data;
    await checkResourceAvailability(driver, camion, remorque, plannedStart, plannedEnd);
    return trajetRepository.create({ departureSite, arrivalSite, plannedStart, plannedEnd, driver, camion, remorque });
}

async function reassignTrip(id, data) {
    const { driver, camion, remorque, plannedStart, plannedEnd } = data;
    const trip = await trajetRepository.findById(id);
    if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    if (trip.status !== 'TODO') throw Object.assign(new Error('Only TODO trips can be reassigned'), { statusCode: 400 });

    await checkResourceAvailability(driver, camion, remorque, plannedStart || trip.plannedStart, plannedEnd || trip.plannedEnd, id);

    if (driver) trip.driver = driver;
    if (camion) trip.camion = camion;
    if (remorque) trip.remorque = remorque;
    if (plannedStart) trip.plannedStart = plannedStart;
    if (plannedEnd) trip.plannedEnd = plannedEnd;

    return trajetRepository.save(trip);
}

async function startTrip(id, startMileage, userId) {
    const trip = await trajetRepository.findById(id);
    if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    if (trip.driver.toString() !== userId) throw Object.assign(new Error('Access forbidden'), { statusCode: 403 });
    if (trip.status !== 'TODO') throw Object.assign(new Error('Trip already started or completed'), { statusCode: 409 });

    trip.status = 'IN_PROGRESS';
    trip.startMileage = startMileage;
    return trajetRepository.save(trip);
}

async function completeTrip(id, { endMileage, fuelConsumed, fuelCost, driverRemarks }, userId) {
    const trip = await trajetRepository.findById(id);
    if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    if (trip.driver.toString() !== userId) throw Object.assign(new Error('Access forbidden'), { statusCode: 403 });
    if (trip.status !== 'IN_PROGRESS') throw Object.assign(new Error('Trip is not in progress'), { statusCode: 409 });
    if (endMileage <= trip.startMileage) throw Object.assign(new Error('End mileage must be greater than start mileage'), { statusCode: 400 });

    trip.status = 'COMPLETED';
    trip.endMileage = endMileage;
    trip.fuelConsumed = fuelConsumed;
    if (fuelCost) trip.fuelCost = fuelCost;
    if (driverRemarks) trip.driverRemarks = driverRemarks;

    if (trip.startMileage != null) {
        trip.distance = endMileage - trip.startMileage;
        if (fuelConsumed && trip.distance > 0) {
            trip.averageConsumption = (fuelConsumed / trip.distance) * 100;
        }
    }

    return trajetRepository.save(trip);
}

module.exports = { assignTrip, reassignTrip, startTrip, completeTrip };
