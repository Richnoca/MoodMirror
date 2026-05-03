import { useState } from 'react';

function LoginPage({ theme, themeName, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const endpoint = isRegistering
      ? 'http://3.89.148.132:5001/auth/register'
      : 'http://3.89.148.132:5001/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Something went wrong.');
        return;
      }

      if (isRegistering) {
        setMessage('Registration successful. Please log in.');
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', data.token);
        window.location.href = '/journal';
      }
    } catch (error) {
      setMessage('Failed to connect to server.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.pageBg,
        color: theme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: theme.cardBg,
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#818cf8' }}>MoodMirror</h1>
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
            {themeName === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <h2>{isRegistering ? 'Register' : 'Login'}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.text
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBg,
                color: theme.text
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: theme.buttonPrimary,
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '12px', color: '#f87171' }}>{message}</p>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage('');
          }}
          style={{
            marginTop: '12px',
            background: 'transparent',
            border: 'none',
            color: '#818cf8',
            cursor: 'pointer'
          }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;