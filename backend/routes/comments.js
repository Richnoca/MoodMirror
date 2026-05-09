import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/*
  POST /comments/:entryId
  Add a comment to a journal entry/post
*/
router.post('/:entryId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const entryId = Number(req.params.entryId);
  const { comment_text } = req.body;

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

   const [entries] = await pool.query(
  'SELECT id, user_id FROM entries WHERE id = ?',
  [entryId]
);

if (entries.length === 0) {
  return res.status(404).json({ error: 'Post not found.' });
}

const entryOwnerId = entries[0].user_id;

await pool.query(
  'INSERT INTO comments (user_id, entry_id, comment_text) VALUES (?, ?, ?)',
  [userId, entryId, comment_text.trim()]
);

if (entryOwnerId !== userId) {
  await pool.query(
    `
    INSERT INTO notifications (recipient_id, actor_id, entry_id, type, message)
    VALUES (?, ?, ?, 'comment', ?)
    `,
    [
      entryOwnerId,
      userId,
      entryId,
      `${req.user.email} commented on your journal entry.`
    ]
  );
}

res.status(201).json({ message: 'Comment added successfully.' }); 

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

/*
  GET /comments/:entryId
  Get all comments for a journal entry/post
*/
router.get('/:entryId', authMiddleware, async (req, res) => {
  const entryId = Number(req.params.entryId);

  try {
    if (!entryId) {
      return res.status(400).json({ error: 'Invalid entry id.' });
    }

    const [comments] = await pool.query(
      `
      SELECT
        comments.id,
        comments.user_id,
        users.email,
        comments.entry_id,
        comments.comment_text,
        comments.created_at
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.entry_id = ?
      ORDER BY comments.created_at ASC
      `,
      [entryId]
    );

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

/*
  DELETE /comments/:commentId
  Delete your own comment
*/
router.delete('/:commentId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const commentId = Number(req.params.commentId);

  try {
    if (!commentId) {
      return res.status(400).json({ error: 'Invalid comment id.' });
    }

    const [result] = await pool.query(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

export default router;
