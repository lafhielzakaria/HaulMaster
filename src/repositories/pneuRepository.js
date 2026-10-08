const Pneu = require('../models/Pneu');

const pneuRepository = {
    findAll: () => Pneu.find().populate('camion', 'matricule marque modele'),

    findById: (id) => Pneu.findById(id).populate('camion', 'matricule marque modele'),

    findOverLimitByCamion: (camionId) => Pneu.findOne({ camion: camionId, $expr: { $gt: ['$kilometrage', '$kilometrageMax'] } }),

    create: (data) => Pneu.create(data),

    update: (id, data) => Pneu.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

    remove: (id) => Pneu.findByIdAndDelete(id),
};

module.exports = pneuRepository;
