const mongoose = require('mongoose');

const remorqueSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true },
    marque:    { type: String, required: true },
    modele:    { type: String, required: true },
    annee:     { type: Number, required: true },
    capacite:  { type: Number, required: true },
    statut:    { type: String, enum: ['active', 'inactive', 'out_of_service', 'maintenance'], default: 'active' },
    maintenanceAlert: { type: String, enum: ['PENDING', 'RESOLVED', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model('Remorque', remorqueSchema);
