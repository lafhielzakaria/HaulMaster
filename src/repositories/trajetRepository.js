const Trajet = require('../models/Trajet');

const trajetRepository = {
    create: (data) => Trajet.create(data),

    findById: (id) => Trajet.findById(id),

    findAll: () => Trajet.find()
        .populate('driver', 'email')
        .populate('camion', 'matricule marque modele')
        .populate('remorque', 'matricule'),

    findByDriverActive: (driverId) => Trajet.find({ driver: driverId, status: { $in: ['TODO', 'IN_PROGRESS'] } })
        .populate('camion', 'matricule marque modele')
        .populate('remorque', 'matricule'),

    findConflict: (query) => Trajet.findOne(query),

    save: (trip) => trip.save(),
};

module.exports = trajetRepository;
