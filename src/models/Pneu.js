const mongoose = require('mongoose');

const pneuSchema = new mongoose.Schema({
    marque:  { type: String, required: true },
    taille:  { type: String, required: true },
    type:    { type: String, required: true },
    statut:  { type: String, enum: ['active', 'inactive', 'out_of_service'], default: 'active' },
    camion:  { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', default: null },
    kilometrage:    { type: Number, default: 0 },
    kilometrageMax: { type: Number, default: 100000 },
}, { timestamps: true });

module.exports = mongoose.model('Pneu', pneuSchema);
