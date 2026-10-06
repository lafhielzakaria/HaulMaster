const Pneu = require('../models/Pneu');

async function getAll(req, res) {
    try {
        const pneus = await Pneu.find().populate('camion', 'matricule marque modele');
        return res.json({ pneus });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getOne(req, res) {
    try {
        const pneu = await Pneu.findById(req.params.id).populate('camion', 'matricule marque modele');
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function create(req, res) {
    try {
        const { marque, taille, type, statut, camion } = req.body;
        const pneu = await Pneu.create({ marque, taille, type, statut, camion: camion || null });
        return res.status(201).json({ message: 'Pneu created', pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function update(req, res) {
    try {
        const pneu = await Pneu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ message: 'Pneu updated', pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function remove(req, res) {
    try {
        const pneu = await Pneu.findByIdAndDelete(req.params.id);
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ message: 'Pneu deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getAll, getOne, create, update, remove };
