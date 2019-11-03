const Joi = require('@hapi/joi');

const schemas = {
    register: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    login: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    createExport: Joi.object({
        start: Joi.string().pattern(/\d{4}-\d{2}-\d{2}/)
            .note('start should be in YYYY-MM-DD'),
    }),
    uuid: Joi.object({
        uuid: Joi.string().uuid({ version: 'uuidv4' }).required()
    })
};

module.exports = schemas;
