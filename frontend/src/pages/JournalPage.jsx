import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getMoodInfo } from '../moodUtils';

const API_BASE = 'http://18.222.199.18:3001';

function JournalPage({ theme, themeName, toggleTheme }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const moodInfo = getMoodInfo(mood);

  function handleMediaChange(e) {
    const file = e.target.files[0];

    if (!file) {
      setMediaFile(null);
      setPreviewUrl('');
      return;
    }

    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadMedia(token) {
    if (!mediaFile) {
      return {
        media_url: null,
        media_type: null
      };
    }

    const formData = new FormData();
    formData.append('media', mediaFile);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload media.');
    }

    return {
      media_url: data.media_url,
      media_type: data.media_type
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    setMessage('');
    setIsSaving(true);

    try {
      const uploadedMedia = await uploadMedia(token);

      const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          mood,
          note,
          tag,
          media_url: uploadedMedia.media_url,
          media_type: uploadedMedia.media_type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save entry.');
        setIsSaving(false);
        return;
      }

      setMessage('Entry saved successfully.');
      setMood('');
      setNote('');
      setTag('');
      setMediaFile(null);
      setPreviewUrl('');
      setIsSaving(false);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Could not connect to server.');
      setIsSaving(false);
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

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Add Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
              onChange={handleMediaChange}
              style={inputStyle}
            />

	{previewUrl && mediaFile?.type?.startsWith('image/') && (
  <img
    src={previewUrl}
    alt="Selected upload preview"
    style={{
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      borderRadius: '12px',
      marginTop: '12px',
      border: `1px solid ${theme.border}`
    }}
  />
)}

{previewUrl && mediaFile?.type?.startsWith('video/') && (
  <video
    src={previewUrl}
    controls
    style={{
      width: '100%',
      borderRadius: '12px',
      marginTop: '12px',
      border: `1px solid ${theme.border}`
    }}
  />
)}            

          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: theme.buttonPrimary,
              color: 'white',
              fontWeight: 'bold',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
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
