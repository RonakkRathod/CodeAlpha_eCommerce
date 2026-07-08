const express = require('express');
const router = express.Router();
const { run, query, get } = require('../db');
const authenticateToken = require('../middleware/auth');

// Create a new order
router.post('/', authenticateToken, async (req, res) => {
  const { shipping_address, items } = req.body;

  if (!shipping_address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Shipping address and items are required' });
  }

  try {
    // 1. Verify all products and check stock, calculate total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await get('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }
      totalAmount += product.price * item.quantity;
      validatedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
        current_stock: product.stock
      });
    }

    // 2. Perform database changes
    // Start transaction manually since we're using raw SQLite
    await run('BEGIN TRANSACTION');

    try {
      // Insert order
      const orderResult = await run(
        'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
        [req.user.id, totalAmount, shipping_address, 'pending']
      );
      const orderId = orderResult.id;

      // Insert items & update stock
      for (const item of validatedItems) {
        // Insert order item
        await run(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Update product stock
        const newStock = item.current_stock - item.quantity;
        await run('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.product_id]);
      }

      await run('COMMIT');
      res.status(201).json({ message: 'Order placed successfully', orderId, total_amount: totalAmount });

    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }

  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ message: 'Failed to process order' });
  }
});

// Fetch user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get all orders for the authenticated user
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    
    // For each order, fetch its items
    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, p.name as product_name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
