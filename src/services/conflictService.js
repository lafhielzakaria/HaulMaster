const Trajet = require('../models/Trajet');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
async function checkResourceAvailability(driverId, camionId, remorqueId, startDate, endDate) {
  const camion = await Camion.findById(camionId);
  const remorque = await Remorque.findById(remorqueId);
  if (!camion || camion.status === 'MAINTENANCE' || !remorque || remorque.status === 'MAINTENANCE') {
    throw new Error('Vehicle is currently under maintenance or not found');
  }
  const conflict = await Trajet.findOne({
    status: { $ne: 'terminé' },
    $or: [
      { driverId, startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { camionId, startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { remorqueId, startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });
  if (conflict) {
    const error = new Error('Resource already booked during this period');
    error.statusCode = 409;
    throw error;
  }
}
module.exports = {
  checkResourceAvailability
};