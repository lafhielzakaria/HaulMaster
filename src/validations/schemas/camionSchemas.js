const Joi = require('joi');

const STATUT = ['active', 'inactive', 'out_of_service'];

const create = Joi.object({
    matricule: Joi.string().required(),
    marque:    Joi.string().required(),
    modele:    Joi.string().required(),
    annee:     Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
    capacite:  Joi.number().positive().required(),
    statut:    Joi.string().valid(...STATUT).default('active'),
});

const update = Joi.object({
    matricule: Joi.string(),
    marque:    Joi.string(),
    modele:    Joi.string(),
    annee:     Joi.number().integer().min(1900).max(new Date().getFullYear()),
    capacite:  Joi.number().positive(),
    statut:    Joi.string().valid(...STATUT),
}).min(1);

module.exports = { create, update };
