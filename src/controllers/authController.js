const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

async function register(req, res) {
    try {
        const { email, password } = req.body;
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userRepository.create({ email, password: hashedPassword, role: 'driver', status: 'waiting_list' });
        return res.status(201).json({
            message: 'Registration successful. Your account is pending admin approval.',
            user: { id: user._id, email: user.email, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        if (user.status === 'waiting_list') {
            return res.status(403).json({ message: 'Your account is pending admin approval.' });
        }
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Your account has been deactivated. Contact an admin.' });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        return res.json({ token, tokenType: 'Bearer', user: { id: user._id, email: user.email, role: user.role, status: user.status } });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function profile(req, res) {
    try {
        const user = await userRepository.findByIdExcludePassword(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getWaitingList(req, res) {
    try {
        const users = await userRepository.findWaitingList();
        return res.json({ users });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function setUserActiveStatus(req, res) {
    try {
        const { id } = req.params;
        const status = req.query.active === 'false' ? 'inactive' : 'active';
        const user = await userRepository.updateStatus(id, status);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { register, login, profile, getWaitingList, setUserActiveStatus };
