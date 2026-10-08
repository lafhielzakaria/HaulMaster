const User = require('../models/User');

const userRepository = {
    findById: (id) => User.findById(id),

    findByEmail: (email) => User.findOne({ email }),

    findByIdExcludePassword: (id) => User.findById(id).select('-password'),

    findWaitingList: () => User.find({ status: 'waiting_list' }).select('-password'),

    create: (data) => User.create(data),

    updateStatus: (id, status) => User.findByIdAndUpdate(id, { status }, { new: true }).select('-password'),
};

module.exports = userRepository;
