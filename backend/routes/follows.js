import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/*
  POST /follows/:userId
  Logged-in user follows another user
*/
router.post('/:userId', authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  try {
    if (!followingId) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [followingId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

   await pool.query(
  'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
  [followerId, followingId]
);

await pool.query(
  `
  INSERT INTO notifications (recipient_id, actor_id, entry_id, type, message)
  VALUES (?, ?, NULL, 'follow', ?)
  `,
  [
    followingId,
    followerId,
    `${req.user.email} followed you.`
  ]
);

res.status(201).json({ message: 'User followed successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You are already following this user.' });
    }

    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user.' });
  }
});

/*
  DELETE /follows/:userId
  Logged-in user unfollows another user
*/
router.delete('/:userId', authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  try {
    if (!followingId) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const [result] = await pool.query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'You are not following this user.' });
    }

    res.json({ message: 'User unfollowed successfully.' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user.' });
  }
});

/*
  GET /follows/me/following
  See who the logged-in user follows
*/
router.get('/me/following', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [following] = await pool.query(
      `
      SELECT
        users.id,
        users.email,
        users.is_admin,
        follows.created_at AS followed_at
      FROM follows
      JOIN users ON follows.following_id = users.id
      WHERE follows.follower_id = ?
      ORDER BY follows.created_at DESC
      `,
      [userId]
    );

    res.json(following);
  } catch (error) {
    console.error('Get my following error:', error);
    res.status(500).json({ error: 'Failed to fetch following list.' });
  }
});

/*
  GET /follows/me/followers
  See who follows the logged-in user
*/
router.get('/me/followers', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [followers] = await pool.query(
      `
      SELECT
        users.id,
        users.email,
        users.is_admin,
        follows.created_at AS followed_at
      FROM follows
      JOIN users ON follows.follower_id = users.id
      WHERE follows.following_id = ?
      ORDER BY follows.created_at DESC
      `,
      [userId]
    );

    res.json(followers);
  } catch (error) {
    console.error('Get my followers error:', error);
    res.status(500).json({ error: 'Failed to fetch followers list.' });
  }
});

/*
  GET /follows/:userId/following
  See who a specific user follows
*/
router.get('/:userId/following', authMiddleware, async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const [following] = await pool.query(
      `
      SELECT
        users.id,
        users.email,
        users.is_admin,
        follows.created_at AS followed_at
      FROM follows
      JOIN users ON follows.following_id = users.id
      WHERE follows.follower_id = ?
      ORDER BY follows.created_at DESC
      `,
      [userId]
    );

    res.json(following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following list.' });
  }
});

/*
  GET /follows/:userId/followers
  See who follows a specific user
*/
router.get('/:userId/followers', authMiddleware, async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const [followers] = await pool.query(
      `
      SELECT
        users.id,
        users.email,
        users.is_admin,
        follows.created_at AS followed_at
      FROM follows
      JOIN users ON follows.follower_id = users.id
      WHERE follows.following_id = ?
      ORDER BY follows.created_at DESC
      `,
      [userId]
    );

    res.json(followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to fetch followers list.' });
  }
});

export default router;
