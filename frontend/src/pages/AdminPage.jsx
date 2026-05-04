import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const API_BASE = 'http://13.59.86.171:3001';

function AdminPage({ theme, themeName, toggleTheme }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      setUsers(data);
      setError('');
      setLoading(false);
    } catch (error) {
      setError('Failed to connect to admin server.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function updateAdminStatus(userId, isAdmin) {
    const token = localStorage.getItem('token');

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_admin: isAdmin })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update user role.');
        return;
      }

      setMessage(data.message || 'User role updated.');
      fetchUsers();
    } catch (error) {
      setError('Failed to connect to admin server.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
        <h1 style={{ color: theme.text }}>Admin Dashboard</h1>
        <p style={{ color: theme.subtext }}>
          View users, account activity, and manage admin roles.
        </p>

        {loading && <p>Loading users...</p>}

        {message && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '12px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: '#4ade80'
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '12px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: '#f87171'
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{
              marginTop: '24px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: theme.navBg }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Entries</th>
                  <th style={thStyle}>Last Entry</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={tdStyle}>{user.id}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>{user.is_admin ? 'Admin' : 'User'}</td>
                    <td style={tdStyle}>{user.entry_count}</td>
                    <td style={tdStyle}>
                      {user.last_entry_at
                        ? new Date(user.last_entry_at).toLocaleString()
                        : 'No entries'}
                    </td>
                    <td style={tdStyle}>
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      {user.is_admin ? (
                        <button
                          onClick={() => updateAdminStatus(user.id, false)}
                          style={dangerButtonStyle}
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => updateAdminStatus(user.id, true)}
                          style={buttonStyle}
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '14px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '14px',
  borderTop: '1px solid rgba(148, 163, 184, 0.25)',
  whiteSpace: 'nowrap'
};

const buttonStyle = {
  padding: '8px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#818cf8',
  color: 'white',
  cursor: 'pointer'
};

const dangerButtonStyle = {
  padding: '8px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#ef4444',
  color: 'white',
  cursor: 'pointer'
};

export default AdminPage;
