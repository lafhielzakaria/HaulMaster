const Camion = require('../models/Camion');

const camionRepository = {
    findAll: (filter = {}) => Camion.find(filter),

    findById: (id) => Camion.findById(id),

    create: (data) => Camion.create(data),

    update: (id, data) => Camion.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

    remove: (id) => Camion.findByIdAndDelete(id),

    save: (camion) => camion.save(),
};

module.exports = camionRepository;
