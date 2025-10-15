// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const productRoutes = require('./routes/products'); // fixed variable name
const middleware = require('./middleware');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./routes/swaggerspec'); // ensure file is named swaggerSpec.js (capital S)

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in JSON body parser
app.use(express.json());

// Logger middleware
app.use(middleware.logger);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount API routes with auth and validation
app.use('/api/products', middleware.authMiddleware, productRoutes);

// Root route
app.get('/', (req, res) => res.send('Hello World - Express server is up!'));

// Global error handler (must be after routes)
app.use(middleware.errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
