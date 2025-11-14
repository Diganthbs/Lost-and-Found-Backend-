const express = require('express');
const pool = require('../db');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// submit response to an item
router.post('/', requireAuth, async (req, res) => {
  try {
    const { item_id, message, contact_info } = req.body;
    const responder_id = req.session.userId;
    // simple assert item exists
    const [items] = await pool.query('SELECT user_id FROM items WHERE id = ?', [item_id]);
    if (!items.length) return res.status(404).json({ error: 'Item not found' });
    const [result] = await pool.query('INSERT INTO responses (item_id,responder_id,message,contact_info) VALUES (?,?,?,?)', [item_id,responder_id,message,contact_info]);
    // Optionally mark something or notify — here we just store.
    res.json({ success: true, responseId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// owner view responses for their items
router.get('/for-owner', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [rows] = await pool.query(`SELECT r.*, u.name as responder_name, i.title as item_title, i.user_id as item_owner
      FROM responses r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.responder_id = u.id
      WHERE i.user_id = ? ORDER BY r.created_at DESC`, [userId]);
    res.json({ responses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// optional: mark a response seen
router.post('/:id/mark-seen', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // ensure owner of the item
    const [rows] = await pool.query(`SELECT i.user_id FROM responses r JOIN items i ON r.item_id = i.id WHERE r.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('UPDATE responses SET seen_by_owner = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


