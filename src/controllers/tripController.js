const Trajet = require('../models/Trajet');
const { checkResourceAvailability } = require('../services/conflictService');

async function createTrip(req, res, next) {
  try {
    const { driverId, camionId, remorqueId, startDate, endDate } = req.body;
    await checkResourceAvailability(driverId, camionId, remorqueId, startDate, endDate);
    const newTrip = await Trajet.create(req.body);
    return res.status(201).json({ success: true, data: newTrip });
  } catch (error) {
    next(error);
  }
}

async function updateTripStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, endMileage, fuelConsumed } = req.body;

    const trip = await Trajet.findById(id);
    if (!trip) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      throw err;
    }

    trip.status = status;
    if (endMileage) trip.endMileage = endMileage;
    if (fuelConsumed) trip.fuelConsumed = fuelConsumed;

    await trip.save();
    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTrip,
  updateTripStatus
};