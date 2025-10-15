// Static swagger specification used by swagger-ui-express
const swaggerSpec = {
openapi: '3.0.0',
info: {
title: 'Products API - Week 2 Express.js',
version: '1.0.0',
description: 'CRUD API for products with middleware and validation',
},
servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
components: {
securitySchemes: {
ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' }
},
schemas: {
Product: {
type: 'object',
properties: {
id: { type: 'string' },
name: { type: 'string' },
description: { type: 'string' },
price: { type: 'number' },
category: { type: 'string' },
inStock: { type: 'boolean' }
}
}
}
},
security: [{ ApiKeyAuth: [] }],
paths: {
'/api/products': {
get: { summary: 'List products', responses: { '200': { description: 'OK' } } },
post: { summary: 'Create product', responses: { '201': { description: 'Created' } } }
},
'/api/products/{id}': {
get: { summary: 'Get product by id', parameters: [{ name: 'id', in: 'path', required: true }] , responses: {'200': { description: 'OK' }}},
put: { summary: 'Update product', parameters: [{ name: 'id', in: 'path', required: true }] , responses: {'200': { description: 'OK' }}},
delete: { summary: 'Delete product', parameters: [{ name: 'id', in: 'path', required: true }] , responses: {'200': { description: 'OK' }}}
},
'/api/products-stats': { get: { summary: 'Products stats', responses: {'200': { description: 'OK' }}} }
}
};


module.exports = swaggerSpec;