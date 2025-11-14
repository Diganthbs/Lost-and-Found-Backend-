const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name,email,password_hash,phone) VALUES (?,?,?,?)', [name,email,hash,phone]);
    req.session.userId = result.insertId;
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT id, password_hash, name FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    res.json({ success: true, userId: user.id, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const [rows] = await pool.query('SELECT id, name, email, phone FROM users WHERE id = ?', [req.session.userId]);
  res.json({ user: rows[0] || null });
});

module.exports = router;


