const Joi = require('joi');

const STATUT = ['active', 'inactive', 'out_of_service'];

const create = Joi.object({
    marque:  Joi.string().required(),
    taille:  Joi.string().required(),
    type:    Joi.string().required(),
    statut:  Joi.string().valid(...STATUT).default('active'),
    camion:  Joi.string().hex().length(24).allow(null).default(null),
});

const update = Joi.object({
    marque:  Joi.string(),
    taille:  Joi.string(),
    type:    Joi.string(),
    statut:  Joi.string().valid(...STATUT),
    camion:  Joi.string().hex().length(24).allow(null),
}).min(1);

module.exports = { create, update };
