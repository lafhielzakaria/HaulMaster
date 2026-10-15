const Trajet = require('../models/Trajet');
const Pneu = require('../models/Pneu');
const Camion = require('../models/Camion');

const analyticsRepository = {
    // ga3 lfuel ligta3 driver / ga3 km lidrab * 100
    //ngroupi bu driver ou njma3 ondir operation wst lgroup stage 
    ecoPerformance: () => Trajet.aggregate([
        {
            $match: {
                status: "COMPLETED"

            }
        },
        {
            $group: {
                _id: "$driver",
                totalFuel: { $sum: "$fuelConsumed" },
                totalDistances: { $sum: "$distance" }
            }
        },
        {
            $project: {
                _id: 0,
                driver: "$_id",
                totalFuel: 1,
                totalDistances: 1,
                ecoPerformance: {
                    $multiply: [
                        {
                            $divide: ["$totalFuel", "$totalDistances"]
                        }, 100
                    ]
                }
            }
        },

    ]),
// 4an jib 5 dyal xa7inat bu limit on order bu desc bu kilometrageMax - kilometrage
    tireHealthMatrix: () => Pneu.aggregate([

    ]),

    financialEsg: (startDate, endDate) => Trajet.aggregate([

    ]),

    fleetUtilizationTrends: () => Camion.aggregate([

    ]),

};

module.exports = analyticsRepository;
