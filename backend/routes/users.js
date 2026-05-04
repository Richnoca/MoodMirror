import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        users.id,
        users.email,
        users.is_admin,
        users.created_at,
        COUNT(entries.id) AS entry_count,
        MAX(entries.created_at) AS last_entry_at
      FROM users
      LEFT JOIN entries ON users.id = entries.user_id
      GROUP BY users.id, users.email, users.is_admin, users.created_at
      ORDER BY users.id
    `);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.patch('/:id/admin', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  try {
    if (typeof is_admin !== 'boolean') {
      return res.status(400).json({ error: 'is_admin must be true or false.' });
    }

    if (Number(id) === req.user.id && is_admin === false) {
      return res.status(400).json({ error: 'You cannot remove your own admin access.' });
    }

    const [result] = await pool.query(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [is_admin, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User role updated successfully.' });
  } catch (error) {
    console.error('Update admin role error:', error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

export default router;
