const Remorque = require('../models/Remorque');

async function getAll(req, res) {
    try {
        const remorques = await Remorque.find();
        return res.json({ remorques });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getOne(req, res) {
    try {
        const remorque = await Remorque.findById(req.params.id);
        if (!remorque) return res.status(404).json({ message: 'Remorque not found' });
        return res.json({ remorque });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function create(req, res) {
    try {
        const { matricule, marque, modele, annee, capacite, statut } = req.body || {};
        if (!matricule || !marque || !modele || !annee || !capacite) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const remorque = await Remorque.create({ matricule, marque, modele, annee, capacite, statut });
        return res.status(201).json({ message: 'Remorque created', remorque });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Matricule already exists' });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function update(req, res) {
    try {
        const remorque = await Remorque.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!remorque) return res.status(404).json({ message: 'Remorque not found' });
        return res.json({ message: 'Remorque updated', remorque });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function remove(req, res) {
    try {
        const remorque = await Remorque.findByIdAndDelete(req.params.id);
        if (!remorque) return res.status(404).json({ message: 'Remorque not found' });
        return res.json({ message: 'Remorque deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getAll, getOne, create, update, remove };
