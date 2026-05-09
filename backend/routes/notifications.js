import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/*
  GET /notifications
  Get the logged-in user's notifications
*/
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [notifications] = await pool.query(
      `
      SELECT
        notifications.id,
        notifications.recipient_id,
        notifications.actor_id,
        actor.email AS actor_email,
        notifications.entry_id,
        notifications.type,
        notifications.message,
        notifications.is_read,
        notifications.created_at
      FROM notifications
      JOIN users AS actor ON notifications.actor_id = actor.id
      WHERE notifications.recipient_id = ?
      ORDER BY notifications.created_at DESC
      `,
      [userId]
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

/*
  GET /notifications/unread-count
  Get unread notification count
*/
router.get('/unread-count', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ unread_count: rows[0].unread_count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
});

/*
  PATCH /notifications/:id/read
  Mark one notification as read
*/
router.patch('/:id/read', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const notificationId = Number(req.params.id);

  try {
    if (!notificationId) {
      return res.status(400).json({ error: 'Invalid notification id.' });
    }

    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

/*
  PATCH /notifications/read-all
  Mark all notifications as read
*/
router.patch('/read-all', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
});

export default router;
