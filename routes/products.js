// routes/products.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  asyncHandler,
  validateProduct,
  NotFoundError,
} = require('../middleware');

const router = express.Router();

// In-memory products array (replace with DB later)
let products = [
  {
    id: uuidv4(),
    name: 'Widget A',
    description: 'A nice widget',
    price: 19.99,
    category: 'gadgets',
    inStock: true,
  },
  {
    id: uuidv4(),
    name: 'Widget B',
    description: 'Another widget',
    price: 29.99,
    category: 'gadgets',
    inStock: false,
  },
  {
    id: uuidv4(),
    name: 'Gizmo C',
    description: 'A useful gizmo',
    price: 49.99,
    category: 'electronics',
    inStock: true,
  },
];

// GET /api/products?category=...&search=...&page=1&limit=10
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 10 } = req.query;

    let filtered = products;

    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + Number(limit);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      data: filtered.slice(start, end),
    });
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return next(new NotFoundError('Product not found'));
    res.json(product);
  })
);

// POST /api/products
router.post(
  '/',
  validateProduct,
  asyncHandler(async (req, res) => {
    const newProduct = { id: uuidv4(), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
  })
);

// PUT /api/products/:id
router.put(
  '/:id',
  validateProduct,
  asyncHandler(async (req, res, next) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return next(new NotFoundError('Product not found'));
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  })
);

// DELETE /api/products/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return next(new NotFoundError('Product not found'));
    const deleted = products.splice(index, 1);
    res.json({ message: 'Product deleted', product: deleted[0] });
  })
);

module.exports = router;
