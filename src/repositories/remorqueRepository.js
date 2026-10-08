const Remorque = require('../models/Remorque');

const remorqueRepository = {
    findAll: () => Remorque.find(),

    findById: (id) => Remorque.findById(id),

    create: (data) => Remorque.create(data),

    update: (id, data) => Remorque.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

    remove: (id) => Remorque.findByIdAndDelete(id),
};

module.exports = remorqueRepository;
