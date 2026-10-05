const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'driver'],
            default: 'driver',
        },
        status: {
            type: String,
            enum: ['waiting_list', 'active', 'inactive', 'suspended'],
            default: 'waiting_list',
        },
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model('User', userSchema);
module.exports = User;
