import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const [posts] = await pool.query(
      `
      SELECT
        entries.id,
        entries.user_id,
        users.email,
        entries.date,
        entries.mood,
        entries.note,
        entries.tag,
        entries.created_at,
	entries.media_url,
	entries.media_type,
        COUNT(DISTINCT likes.id) AS like_count,
        CASE
          WHEN my_likes.id IS NULL THEN 0
          ELSE 1
        END AS liked_by_me
      FROM entries
      JOIN users
        ON entries.user_id = users.id
      JOIN follows
        ON follows.following_id = entries.user_id
        AND follows.follower_id = ?
      LEFT JOIN likes
        ON likes.entry_id = entries.id
      LEFT JOIN likes AS my_likes
        ON my_likes.entry_id = entries.id
        AND my_likes.user_id = ?
      GROUP BY
        entries.id,
        entries.user_id,
        users.email,
        entries.date,
        entries.mood,
        entries.note,
        entries.tag,
	entries.media_url,
	entries.media_type,
        entries.created_at,
        my_likes.id
      ORDER BY entries.created_at DESC
      `,
      [currentUserId, currentUserId]
    );

    res.json(posts);
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed.' });
  }
});

export default router;

