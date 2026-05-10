import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const API_BASE = 'http://18.222.199.18:3001';

function FeedPage({ theme, themeName, toggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchCommentsForPost(entryId) {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/comments/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load comments.');
        return;
      }

      setCommentsByPost((prev) => ({
        ...prev,
        [entryId]: data
      }));
    } catch (error) {
      setError('Failed to connect to comments server.');
    }
  }

  async function fetchFeed() {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/feed`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load feed.');
        setLoading(false);
        return;
      }

      setPosts(data);
      setError('');
      setLoading(false);

      data.forEach((post) => {
        fetchCommentsForPost(post.id);
      });
    } catch (error) {
      setError('Failed to connect to server.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, []);

  async function likePost(entryId) {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/likes/${entryId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to like post.');
        return;
      }

      setMessage(data.message || 'Post liked.');
      fetchFeed();
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  async function unlikePost(entryId) {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/likes/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to unlike post.');
        return;
      }

      setMessage(data.message || 'Post unliked.');
      fetchFeed();
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  async function addComment(entryId) {
    const token = localStorage.getItem('token');
    const commentText = commentInputs[entryId];

    if (!commentText || !commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/comments/${entryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          comment_text: commentText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add comment.');
        return;
      }

      setMessage(data.message || 'Comment added.');
      setCommentInputs((prev) => ({
        ...prev,
        [entryId]: ''
      }));
      fetchCommentsForPost(entryId);
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  async function deleteComment(commentId, entryId) {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete comment.');
        return;
      }

      setMessage(data.message || 'Comment deleted.');
      fetchCommentsForPost(entryId);
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <main style={{ maxWidth: '850px', margin: '40px auto', padding: '20px' }}>
        <h1 style={{ color: theme.text }}>Feed</h1>
        <p style={{ color: theme.subtext }}>
          See journal entries from people you follow.
        </p>

        {message && <div style={successBoxStyle}>{message}</div>}
        {error && <div style={errorBoxStyle}>{error}</div>}

        {loading && <p style={{ marginTop: '24px' }}>Loading feed...</p>}

        {!loading && !error && posts.length === 0 && (
          <div
            style={{
              marginTop: '24px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '20px',
              color: theme.subtext
            }}
          >
            No posts yet. Follow users on the People page to see their entries here.
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div style={{ display: 'grid', gap: '18px', marginTop: '24px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '18px',
                  padding: '22px',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', color: theme.text }}>
                      {post.email}
                    </h3>
                    <p style={{ margin: 0, color: theme.subtext }}>
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: '#818cf8',
                      color: 'white',
                      fontWeight: 'bold',
                      height: 'fit-content'
                    }}
                  >
                    {post.mood}
                  </div>
                </div>

                <p style={{ marginTop: '18px', lineHeight: '1.6' }}>
                  {post.note || 'No note added.'}
                </p>

		{post.media_url && post.media_type?.startsWith('image/') && (
  <img
    src={`http://18.222.199.18:3001${post.media_url}`}
    alt="Post media"
    style={{
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      borderRadius: '14px',
      marginTop: '16px',
      marginBottom: '16px',
      border: `1px solid ${theme.border}`
    }}
  />
)}

{post.media_url && post.media_type?.startsWith('video/') && (
  <video
    src={`http://18.222.199.18:3001${post.media_url}`}
    controls
    style={{
      width: '100%',
      borderRadius: '14px',
      marginTop: '16px',
      marginBottom: '16px',
      border: `1px solid ${theme.border}`
    }}
  />
)}

                <div style={{ color: theme.subtext, marginBottom: '18px' }}>
                  Tag: {post.tag || 'None'} | Date: {new Date(post.date).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() =>
                      post.liked_by_me ? unlikePost(post.id) : likePost(post.id)
                    }
                    style={post.liked_by_me ? dangerButtonStyle : buttonStyle}
                  >
                    {post.liked_by_me ? 'Unlike' : 'Like'}
                  </button>

                  <span style={{ color: theme.subtext }}>
                    {post.like_count} {Number(post.like_count) === 1 ? 'like' : 'likes'}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '22px',
                    borderTop: `1px solid ${theme.border}`,
                    paddingTop: '18px'
                  }}
                >
                  <h4 style={{ margin: '0 0 12px', color: theme.text }}>
                    Comments
                  </h4>

                  <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                    {(commentsByPost[post.id] || []).length === 0 ? (
                      <p style={{ margin: 0, color: theme.subtext }}>
                        No comments yet.
                      </p>
                    ) : (
                      commentsByPost[post.id].map((comment) => (
                        <div
                          key={comment.id}
                          style={{
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                            <div>
                              <strong>{comment.email}</strong>
                              <p style={{ margin: '6px 0', lineHeight: '1.5' }}>
                                {comment.comment_text}
                              </p>
                              <small style={{ color: theme.subtext }}>
                                {new Date(comment.created_at).toLocaleString()}
                              </small>
                            </div>

                            <button
                              onClick={() => deleteComment(comment.id, post.id)}
                              style={smallDangerButtonStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text
                      }}
                    />

                    <button
                      onClick={() => addComment(post.id)}
                      style={buttonStyle}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const buttonStyle = {
  padding: '9px 14px',
  borderRadius: '10px',
  border: 'none',
  background: '#818cf8',
  color: 'white',
  cursor: 'pointer'
};

const dangerButtonStyle = {
  ...buttonStyle,
  background: '#ef4444'
};

const smallDangerButtonStyle = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: 'none',
  background: '#ef4444',
  color: 'white',
  cursor: 'pointer',
  height: 'fit-content'
};

const successBoxStyle = {
  marginTop: '20px',
  padding: '14px',
  borderRadius: '12px',
  background: 'rgba(34, 197, 94, 0.12)',
  border: '1px solid rgba(34, 197, 94, 0.35)',
  color: '#4ade80'
};

const errorBoxStyle = {
  marginTop: '20px',
  padding: '14px',
  borderRadius: '12px',
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  color: '#f87171'
};

export default FeedPage;
