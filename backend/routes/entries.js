import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { date, mood, note, tag } = req.body;

  try {
    await pool.query(
      'INSERT INTO entries (user_id, date, mood, note, tag) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, date, mood, note, tag]
    );

    res.status(201).json({ message: 'Entry created successfully.' });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry.' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { date, mood, note, tag } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE entries SET date = ?, mood = ?, note = ?, tag = ? WHERE id = ? AND user_id = ?',
      [date, mood, note, tag, id, req.user.id]
    );

    res.json({ message: 'Entry updated successfully.' });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry.' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Entry deleted successfully.' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

export default router;