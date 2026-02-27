import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /expenses?category=...
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let result;
    if (category) {
      result = await pool.query('SELECT * FROM expense WHERE category = $1 ORDER BY created_at DESC', [category]);
    } else {
      result = await pool.query('SELECT * FROM expense ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /expenses
router.post('/', async (req, res) => {
  try {
    const { title, description, category, amount } = req.body;
    if (!title || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const result = await pool.query(
      'INSERT INTO expense (title, description, category, amount) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, description, category, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, amount } = req.body;
    if (!title || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const result = await pool.query(
      'UPDATE expense SET title=$1, description=$2, category=$3, amount=$4 WHERE id=$5 RETURNING *',
      [title, description, category, amount, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expense WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;