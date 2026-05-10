import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:entryId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const entryId = Number(req.params.entryId);

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    const [entries] = await pool.query(
      'SELECT id FROM entries WHERE id = ?',
      [entryId]
    );

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const entryOwnerId = entries[0].user_id;

await pool.query(
  'INSERT INTO likes (user_id, entry_id) VALUES (?, ?)',
  [userId, entryId]
);

if (entryOwnerId !== userId) {
  try {
    await pool.query(
      `
      INSERT INTO notifications (recipient_id, actor_id, entry_id, type, message)
      VALUES (?, ?, ?, 'like', ?)
      `,
      [
        entryOwnerId,
        userId,
        entryId,
        `${req.user.email} liked your journal entry.`
      ]
    );
  } catch (notificationError) {
    console.error('Like notification error:', notificationError);
  }
}

res.status(201).json({ message: 'Post liked successfully.' });  


  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You already liked this post.' });
    }

    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post.' });
  }
});

router.delete('/:entryId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const entryId = Number(req.params.entryId);

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    const [result] = await pool.query(
      'DELETE FROM likes WHERE user_id = ? AND entry_id = ?',
      [userId, entryId]
    );

    console.log('UNLIKE RESULT:', {
      userId,
      entryId,
      affectedRows: result.affectedRows
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'You have not liked this post.' });
    }

    res.json({ message: 'Post unliked successfully.' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post.' });
  }
});

router.get('/:entryId/count', authMiddleware, async (req, res) => {
  const entryId = Number(req.params.entryId);

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    const [likes] = await pool.query(
      'SELECT COUNT(*) AS like_count FROM likes WHERE entry_id = ?',
      [entryId]
    );

    res.json({
      entry_id: entryId,
      like_count: likes[0].like_count
    });
  } catch (error) {
    console.error('Get like count error:', error);
    res.status(500).json({ error: 'Failed to fetch like count.' });
  }
});

router.get('/:entryId/status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const entryId = Number(req.params.entryId);

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    const [likes] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND entry_id = ?',
      [userId, entryId]
    );

    res.json({
      entry_id: entryId,
      liked: likes.length > 0
    });
  } catch (error) {
    console.error('Get like status error:', error);
    res.status(500).json({ error: 'Failed to fetch like status.' });
  }
});

export default router;
