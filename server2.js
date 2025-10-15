// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'supersecretkey';

// --- Middlewares ---

// body parser (task requirement)
app.use(bodyParser.json());

// Logger middleware: logs method, url, timestamp
function logger(req, res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
}
app.use(logger);

// Authentication middleware: expects x-api-key header
function authMiddleware(req, res, next) {
  const key = req.headers['x-api-key'] || req.headers['api-key'] || null;
  if (!key || key !== API_KEY) {
    const err = new UnauthorizedError('Invalid or missing API key');
    return next(err);
  }
  next();
}

// Validation middleware for product create/update
function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  if (!name || typeof name !== 'string') errors.push('name (string) is required');
  if (!description || typeof description !== 'string') errors.push('description (string) is required');
  if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) errors.push('price (number) is required');
  if (!category || typeof category !== 'string') errors.push('category (string) is required');
  if (inStock === undefined || typeof inStock !== 'boolean') errors.push('inStock (boolean) is required');

  if (errors.length) return next(new ValidationError(errors.join('; ')));
  next();
}

// Async wrapper so thrown errors are forwarded to error handler
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Custom Error Classes ---
class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found', details = null) {
    super(message, 404, details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation Error', details = null) {
    super(message, 400, details || message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
  }
}

// --- In-memory "database" (start with some sample data) ---
let products = [
  { id: uuidv4(), name: 'Widget A', description: 'A nice widget', price: 19.99, category: 'gadgets', inStock: true },
  { id: uuidv4(), name: 'Widget B', description: 'Another widget', price: 29.99, category: 'gadgets', inStock: false },
  { id: uuidv4(), name: 'Sprocket', description: 'Essential sprocket', price: 9.99, category: 'hardware', inStock: true },
];

// --- Routes ---

// Hello world root
app.get('/', (req, res) => res.send('Hello World - Express server is up!'));

// Grouped API routes
const router = express.Router();

// List all products with filtering, pagination, search
// GET /api/products?category=gadgets&page=1&limit=10&search=widget
router.get('/products', authMiddleware, asyncHandler(async (req, res) => {
  let { category, page = 1, limit = 10, search } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;

  let result = products.slice();

  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = result.slice(start, end);

  res.json({
    page,
    limit,
    total,
    data: paginated,
  });
}));

// Get by id
router.get('/products/:id', authMiddleware, asyncHandler(async (req, res, next) => {
  const p = products.find(pr => pr.id === req.params.id);
  if (!p) throw new NotFoundError('Product not found');
  res.json(p);
}));

// Create new product
router.post('/products', authMiddleware, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newP = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newP);
  res.status(201).json(newP);
}));

// Update existing product
router.put('/products/:id', authMiddleware, validateProduct, asyncHandler(async (req, res, next) => {
  const index = products.findIndex(pr => pr.id === req.params.id);
  if (index === -1) throw new NotFoundError('Product not found');
  const { name, description, price, category, inStock } = req.body;
  products[index] = { ...products[index], name, description, price, category, inStock };
  res.json(products[index]);
}));

// Delete a product
router.delete('/products/:id', authMiddleware, asyncHandler(async (req, res, next) => {
  const index = products.findIndex(pr => pr.id === req.params.id);
  if (index === -1) throw new NotFoundError('Product not found');
  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'Deleted', product: deleted });
}));

// Statistics: count by category
router.get('/products-stats', authMiddleware, asyncHandler(async (req, res) => {
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json({ total: products.length, byCategory: stats });
}));

app.use('/api', router);

// --- Global error handler ---
app.use((err, req, res, next) => {
  // If not an AppError, convert it
  if (!(err instanceof AppError)) {
    console.error('Unexpected error:', err);
    err = new AppError(err.message || 'Internal Server Error', err.status || 500);
  }

  const payload = {
    status: err.status,
    message: err.message,
  };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack;
  }
  if (err.details) payload.details = err.details;

  res.status(err.status || 500).json(payload);
});

// --- Swagger / OpenAPI setup ---
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Products API - Week 2 Express.js',
    version: '1.0.0',
    description: 'CRUD API for products with middleware, validation, filtering, pagination, search, and stats',
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Local server' }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
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
          inStock: { type: 'boolean' },
        },
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [], // no external files; we'll build spec programmatically below
};

const swaggerSpec = swaggerJSDoc(options);

// Manually add paths to the spec for clarity (simple)
swaggerSpec.paths = {
  '/api/products': {
    get: {
      summary: 'List products',
      parameters: [
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: { '200': { description: 'A list of products' } },
      security: [{ ApiKeyAuth: [] }],
    },
    post: {
      summary: 'Create product',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Product' },
            example: { name: 'New', description: 'desc', price: 10.5, category: 'gadgets', inStock: true },
          },
        },
      },
      responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } },
      security: [{ ApiKeyAuth: [] }],
    },
  },
  '/api/products/{id}': {
    get: {
      summary: 'Get product by ID',
      parameters: [{ name: 'id', in: 'path', required: true }],
      responses: { '200': { description: 'Product' }, '404': { description: 'Not found' } },
      security: [{ ApiKeyAuth: [] }],
    },
    put: {
      summary: 'Update product',
      parameters: [{ name: 'id', in: 'path', required: true }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
      },
      responses: { '200': { description: 'Updated' }, '400': { description: 'Validation error' } },
      security: [{ ApiKeyAuth: [] }],
    },
    delete: {
      summary: 'Delete product',
      parameters: [{ name: 'id', in: 'path', required: true }],
      responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } },
      security: [{ ApiKeyAuth: [] }],
    },
  },
  '/api/products-stats': {
    get: {
      summary: 'Get product statistics (count by category)',
      responses: { '200': { description: 'Stats' } },
      security: [{ ApiKeyAuth: [] }],
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
