const Trajet = require('../models/Trajet');
const Pneu = require('../models/Pneu');
const Camion = require('../models/Camion');

const analyticsRepository = {
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
    tireHealthMatrix: () => Pneu.aggregate([
        {
            $match: {
                statut: "active"
            }
        },
        {
            $addFields: {
                difference: {
                    $subtract: ["$kilometrageMax", "$kilometrage"]
                }
            }
        },
        {
            $sort: { difference: -1 }
        },
        {
            $project: {
                camion: 1,
                marque: 1,
                taille: 1,
                type: 1,
                statut: 1,
                kilometrage: 1,
                kilometrageMax: 1,
                difference: 1

            }
        },
        {
            $limit: 5
        }
    ]),



    financialEsg: () => Trajet.aggregate([
        {
            $match: {
                status: "COMPLETED"
            }
        },
        {
            $addFields: {
                totalCo2EmissionsTonnes: {
                    $divide: [
                        {
                            $multiply: [
                                "$fuelConsumedLiters",
                                2.68
                            ]
                        },
                        1000
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                totalCompletedTrips: {
                    $sum: 1
                },
                totalFuelConsumedLiters: {
                    $sum: "$fuelConsumedLiters"
                },
                totalCo2EmissionsTonnes: {
                    $sum: "$totalCo2EmissionsTonnes"
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalCompletedTrips: 1,
                totalFuelConsumedLiters: 1,
                totalCo2EmissionsTonnes: 1
            }
        }
    ]),




    fleetUtilizationTrends: () => Camion.aggregate([
        
    ])
};

module.exports = analyticsRepository;
