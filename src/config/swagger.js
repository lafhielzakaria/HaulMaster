const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HaulMaster API',
            version: '1.0.0',
            description: 'API de Gestion de Flotte de Transport Routier',
        },
        servers: [{ url: 'http://localhost:5000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/shared/*.js', './src/routes/v1/*.js', './src/routes/v2/*.js'],
};

module.exports = swaggerJsdoc(options);
