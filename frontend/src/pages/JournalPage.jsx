import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getMoodInfo } from '../moodUtils';

function JournalPage({ theme, themeName, toggleTheme }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [message, setMessage] = useState('');

  const moodInfo = getMoodInfo(mood);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://3.89.148.132:5001/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, mood, note, tag })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save entry.');
        return;
      }

      setMessage('Entry saved successfully.');
      setMood('');
      setNote('');
      setTag('');
    } catch (error) {
      console.error(error);
      setMessage('Could not connect to server.');
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: theme.text
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <div
        style={{
          maxWidth: '600px',
          margin: '40px auto',
          background: theme.cardBg,
          borderRadius: '16px',
          padding: '28px',
          boxShadow:
            themeName === 'light'
              ? '0 8px 20px rgba(15,23,42,0.08)'
              : '0 10px 25px rgba(0,0,0,0.18)',
          border: `1px solid ${theme.border}`
        }}
      >
        <h1 style={{ marginBottom: '24px', color: theme.text }}>Daily Journal</h1>
        <p style={{ color: theme.subtext, marginBottom: '24px' }}>
          Track how you feel and what’s on your mind today.
        </p>

        {mood && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px',
              borderRadius: '12px',
              background: moodInfo.color,
              border: `2px solid ${moodInfo.border}`,
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0f172a'
            }}
          >
            {moodInfo.emoji} {moodInfo.label}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select mood</option>
              <option value="great">😄 Great</option>
              <option value="good">🙂 Good</option>
              <option value="okay">😐 Okay</option>
              <option value="low">😞 Low</option>
              <option value="bad">😢 Bad</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              style={inputStyle}
            >
              <option value="">No tag</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Health">Health</option>
              <option value="Friends">Friends</option>
              <option value="School">School</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="5"
              style={inputStyle}
              placeholder="How are you feeling today?"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: theme.buttonPrimary,
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Save Entry
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '16px',
              color: themeName === 'light' ? '#7c3aed' : '#c4b5fd',
              fontWeight: 'bold'
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default JournalPage;