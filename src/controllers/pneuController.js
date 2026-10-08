const pneuRepository = require('../repositories/pneuRepository');

async function getAll(req, res) {
    try {
        const pneus = await pneuRepository.findAll();
        return res.json({ pneus });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getOne(req, res) {
    try {
        const pneu = await pneuRepository.findById(req.params.id);
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function create(req, res) {
    try {
        const { marque, taille, type, statut, camion } = req.body;
        const pneu = await pneuRepository.create({ marque, taille, type, statut, camion: camion || null });
        return res.status(201).json({ message: 'Pneu created', pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function update(req, res) {
    try {
        const pneu = await pneuRepository.update(req.params.id, req.body);
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ message: 'Pneu updated', pneu });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function remove(req, res) {
    try {
        const pneu = await pneuRepository.remove(req.params.id);
        if (!pneu) return res.status(404).json({ message: 'Pneu not found' });
        return res.json({ message: 'Pneu deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getAll, getOne, create, update, remove };
