const Joi = require('joi');

const assign = Joi.object({
    departureSite: Joi.string().required(),
    arrivalSite:   Joi.string().required(),
    plannedStart:  Joi.date().greater('now').required(),
    plannedEnd:    Joi.date().greater(Joi.ref('plannedStart')).required(),
    driver:        Joi.string().hex().length(24).required(),
    camion:        Joi.string().hex().length(24).required(),
    remorque:      Joi.string().hex().length(24).required(),
});

module.exports = { assign };
