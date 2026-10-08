const camionRepository = require('../repositories/camionRepository');

async function getAll(req, res) {
    try {
        const filter = {};
        if (req.query.statut) filter.statut = req.query.statut;
        const camions = await camionRepository.findAll(filter);
        return res.json({ camions });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getOne(req, res) {
    try {
        const camion = await camionRepository.findById(req.params.id);
        if (!camion) return res.status(404).json({ message: 'Camion not found' });
        return res.json({ camion });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function create(req, res) {
    try {
        const { matricule, marque, modele, annee, capacite, statut } = req.body;
        const camion = await camionRepository.create({ matricule, marque, modele, annee, capacite, statut });
        return res.status(201).json({ message: 'Camion created', camion });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Matricule already exists' });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function update(req, res) {
    try {
        const camion = await camionRepository.update(req.params.id, req.body);
        if (!camion) return res.status(404).json({ message: 'Camion not found' });
        return res.json({ message: 'Camion updated', camion });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function remove(req, res) {
    try {
        const camion = await camionRepository.remove(req.params.id);
        if (!camion) return res.status(404).json({ message: 'Camion not found' });
        return res.json({ message: 'Camion deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function setStatus(req, res) {
    try {
        const allowed = ['active', 'inactive', 'out_of_service', 'maintenance'];
        const statut = req.body?.statut;
        if (!statut || !allowed.includes(statut)) {
            return res.status(400).json({ message: `statut must be one of: ${allowed.join(', ')}` });
        }
        const camion = await camionRepository.findById(req.params.id);
        if (!camion) return res.status(404).json({ message: 'Camion not found' });
        if (camion.statut === statut) return res.status(400).json({ message: `Camion is already ${statut}` });
        camion.statut = statut;
        await camionRepository.save(camion);
        return res.json({ message: `Camion status updated to ${statut}`, camion });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getAll, getOne, create, update, remove, setStatus };
