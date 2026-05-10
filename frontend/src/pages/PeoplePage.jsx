import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const API_BASE = 'http://18.222.199.18:3001';

function PeoplePage({ theme, themeName, toggleTheme }) {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchNetworkData() {
    const token = localStorage.getItem('token');

    try {
      const [discoverRes, followingRes, followersRes] = await Promise.all([
        fetch(`${API_BASE}/users/discover`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/follows/me/following`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/follows/me/followers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const discoverData = await discoverRes.json();
      const followingData = await followingRes.json();
      const followersData = await followersRes.json();

      if (!discoverRes.ok) {
        setError(discoverData.error || 'Failed to load users.');
        setLoading(false);
        return;
      }

      if (!followingRes.ok) {
        setError(followingData.error || 'Failed to load following list.');
        setLoading(false);
        return;
      }

      if (!followersRes.ok) {
        setError(followersData.error || 'Failed to load followers list.');
        setLoading(false);
        return;
      }

      setUsers(discoverData);
      setFollowing(followingData);
      setFollowers(followersData);
      setError('');
      setLoading(false);
    } catch (error) {
      setError('Failed to connect to server.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNetworkData();
  }, []);

  async function followUser(userId) {
    const token = localStorage.getItem('token');

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/follows/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to follow user.');
        return;
      }

      setMessage(data.message || 'User followed.');
      fetchNetworkData();
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  async function unfollowUser(userId) {
    const token = localStorage.getItem('token');

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/follows/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to unfollow user.');
        return;
      }

      setMessage(data.message || 'User unfollowed.');
      fetchNetworkData();
    } catch (error) {
      setError('Failed to connect to server.');
    }
  }

  function renderUserCard(user, showAction = true) {
    return (
      <div
        key={user.id}
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 6px', color: theme.text }}>{user.email}</h3>
          <p style={{ margin: 0, color: theme.subtext }}>
            {user.is_admin ? 'Admin' : 'User'}
          </p>
        </div>

        {showAction && (
          user.is_following ? (
            <button onClick={() => unfollowUser(user.id)} style={dangerButtonStyle}>
              Unfollow
            </button>
          ) : (
            <button onClick={() => followUser(user.id)} style={buttonStyle}>
              Follow
            </button>
          )
        )}
      </div>
    );
  }

  let visibleUsers = users;

  if (activeTab === 'following') {
    visibleUsers = following.map((user) => ({
      ...user,
      is_following: 1
    }));
  }

  if (activeTab === 'followers') {
    visibleUsers = followers.map((user) => {
      const matchingUser = users.find((u) => u.id === user.id);

      return {
        ...user,
        is_following: matchingUser ? matchingUser.is_following : 0
      };
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
        <h1 style={{ color: theme.text }}>People</h1>
        <p style={{ color: theme.subtext }}>
          Discover other MoodMirror users and build your network.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('discover')}
            style={activeTab === 'discover' ? activeTabStyle : tabStyle}
          >
            Discover
          </button>

          <button
            onClick={() => setActiveTab('following')}
            style={activeTab === 'following' ? activeTabStyle : tabStyle}
          >
            Following ({following.length})
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            style={activeTab === 'followers' ? activeTabStyle : tabStyle}
          >
            Followers ({followers.length})
          </button>
        </div>

        {message && <div style={successBoxStyle}>{message}</div>}
        {error && <div style={errorBoxStyle}>{error}</div>}

        {loading && <p style={{ marginTop: '24px' }}>Loading people...</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
            {visibleUsers.length === 0 ? (
              <div
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '16px',
                  padding: '20px',
                  color: theme.subtext
                }}
              >
                No users to show here yet.
              </div>
            ) : (
              visibleUsers.map((user) => renderUserCard(user, activeTab !== 'following'))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const tabStyle = {
  padding: '9px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer'
};

const activeTabStyle = {
  ...tabStyle,
  background: '#818cf8',
  color: 'white',
  border: '1px solid #818cf8'
};

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

export default PeoplePage;
