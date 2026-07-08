const express = require('express');
const router = express.Router();
const { query, get } = require('../db');

// Get all products (with optional search and category filters)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];

    const conditions = [];
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('name LIKE ? OR description LIKE ?');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const products = await query(sql, params);
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
