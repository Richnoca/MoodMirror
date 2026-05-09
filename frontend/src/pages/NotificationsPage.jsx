import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const API_BASE = 'http://18.217.16.106:3001';

function NotificationsPage({ theme, themeName, toggleTheme }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    const token = localStorage.getItem('token');

    try {
      const [notificationsRes, countRes] = await Promise.all([
        fetch(`${API_BASE}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      const notificationsData = await notificationsRes.json();
      const countData = await countRes.json();

      if (!notificationsRes.ok) {
        setError(notificationsData.error || 'Failed to load notifications.');
        setLoading(false);
        return;
      }

      if (!countRes.ok) {
        setError(countData.error || 'Failed to load unread count.');
        setLoading(false);
        return;
      }

      setNotifications(notificationsData);
      setUnreadCount(Number(countData.unread_count));
      setError('');
      setLoading(false);
    } catch (error) {
      setError('Failed to connect to notification server.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function markOneAsRead(notificationId) {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to mark notification as read.');
        return;
      }

      setMessage(data.message || 'Notification marked as read.');
      fetchNotifications();
    } catch (error) {
      setError('Failed to connect to notification server.');
    }
  }

  async function markAllAsRead() {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to mark notifications as read.');
        return;
      }

      setMessage(data.message || 'All notifications marked as read.');
      fetchNotifications();
    } catch (error) {
      setError('Failed to connect to notification server.');
    }
  }

  function getTypeLabel(type) {
    if (type === 'follow') return 'New follower';
    if (type === 'like') return 'New like';
    if (type === 'comment') return 'New comment';
    return 'Notification';
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <main style={{ maxWidth: '850px', margin: '40px auto', padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h1 style={{ color: theme.text, marginBottom: '8px' }}>Notifications</h1>
            <p style={{ color: theme.subtext, margin: 0 }}>
              You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            style={buttonStyle}
            disabled={notifications.length === 0}
          >
            Mark all as read
          </button>
        </div>

        {message && <div style={successBoxStyle}>{message}</div>}
        {error && <div style={errorBoxStyle}>{error}</div>}

        {loading && <p style={{ marginTop: '24px' }}>Loading notifications...</p>}

        {!loading && !error && notifications.length === 0 && (
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
            No notifications yet.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div style={{ display: 'grid', gap: '14px', marginTop: '24px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${notification.is_read ? theme.border : '#818cf8'}`,
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: notification.is_read
                    ? '0 6px 14px rgba(0,0,0,0.05)'
                    : '0 8px 20px rgba(129,140,248,0.18)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '5px 9px',
                        borderRadius: '999px',
                        background: notification.is_read ? theme.bg : '#818cf8',
                        color: notification.is_read ? theme.subtext : 'white',
                        fontSize: '13px',
                        marginBottom: '10px'
                      }}
                    >
                      {getTypeLabel(notification.type)}
                    </div>

                    <p style={{ margin: '0 0 8px', color: theme.text }}>
                      {notification.message}
                    </p>

                    <small style={{ color: theme.subtext }}>
                      {new Date(notification.created_at).toLocaleString()}
                    </small>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => markOneAsRead(notification.id)}
                      style={smallButtonStyle}
                    >
                      Mark read
                    </button>
                  )}
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

const smallButtonStyle = {
  ...buttonStyle,
  padding: '7px 11px',
  whiteSpace: 'nowrap'
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

export default NotificationsPage;
