import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar({ theme, themeName, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  let isAdmin = false;

  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      isAdmin = decoded.is_admin === 1;
    } catch (error) {
      isAdmin = false;
    } 
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  function linkStyle(path) {
    return {
      textDecoration: 'none',
      color: location.pathname === path ? '#818cf8' : theme.text,
      fontWeight: location.pathname === path ? 'bold' : 'normal'
    };
  }

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 28px',
        background: theme.navBg,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#818cf8' }}>
        MoodMirror
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/journal" style={linkStyle('/journal')}>Journal</Link>
        <Link to="/history" style={linkStyle('/history')}>History</Link>
	{isAdmin && (
 	 <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>
	)}

        <button
          onClick={toggleTheme}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            background: theme.cardBg,
            color: theme.text,
            cursor: 'pointer'
          }}
        >
          {themeName === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: 'none',
            background: theme.buttonDark,
            color: themeName === 'light' ? 'white' : '#0f172a',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
