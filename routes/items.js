const express = require('express');
const pool = require('../db');
const router = express.Router();

// Helper auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// create item
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category_id, location_id, additional_address, reported_date, photo_url } = req.body;
    const user_id = req.session.userId;
    const [result] = await pool.query(
      'INSERT INTO items (user_id,title,description,category_id,location_id,additional_address,reported_date,photo_url) VALUES (?,?,?,?,?,?,?,?)',
      [user_id, title, description, category_id || null, location_id || null, additional_address || null, reported_date, photo_url || null]
    );
    res.json({ success: true, itemId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// list / search
router.get('/', async (req, res) => {
  try {
    const { q, category_id, location_id, status } = req.query;
    let query = `SELECT i.*, u.name as owner_name, c.name as category_name, l.name as location_name
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  LEFT JOIN categories c ON i.category_id = c.id
                  LEFT JOIN locations l ON i.location_id = l.id
                  WHERE 1=1 `;
    const params = [];
    if (q) {
      query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push('%' + q + '%', '%' + q + '%');
    }
    if (category_id) { query += ' AND i.category_id = ?'; params.push(category_id); }
    if (location_id) { query += ' AND i.location_id = ?'; params.push(location_id); }
    if (status) { query += ' AND i.status = ?'; params.push(status); }
    query += ' ORDER BY i.created_at DESC LIMIT 200';
    const [rows] = await pool.query(query, params);
    res.json({ items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get single item
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(
    `SELECT i.*, u.name as owner_name, c.name as category_name, l.name as location_name
     FROM items i
     LEFT JOIN users u ON i.user_id = u.id
     LEFT JOIN categories c ON i.category_id = c.id
     LEFT JOIN locations l ON i.location_id = l.id
     WHERE i.id = ?`, [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ item: rows[0] });
});

// owner marks found
router.post('/:id/mark-found', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // ensure owner
    const [rows] = await pool.query('SELECT user_id FROM items WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('UPDATE items SET status = "found" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// owner deletes/removes item
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // ensure owner
    const [rows] = await pool.query('SELECT user_id FROM items WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


