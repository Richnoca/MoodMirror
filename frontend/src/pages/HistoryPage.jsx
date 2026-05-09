import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import Navbar from '../components/Navbar';
import { getMoodInfo } from '../moodUtils';

function HistoryPage({ theme, themeName, toggleTheme }) {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editForm, setEditForm] = useState({
    date: '',
    mood: '',
    tag: '',
    note: ''
  });

  useEffect(() => {
    async function fetchEntries() {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://18.217.16.106:3001/entries', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || 'Failed to load entries.');
          return;
        }

        setEntries(data);
      } catch (error) {
        console.error(error);
        setMessage('Could not connect to server.');
      }
    }

    fetchEntries();
  }, []);

  const entriesByDate = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      const key = entry.date?.split('T')[0] || entry.date;
      map[key] = entry;
    }
    return map;
  }, [entries]);

  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const filteredEntries = entries.filter((entry) => {
    const entryDate = entry.date?.split('T')[0] || entry.date;
    return entryDate === selectedDateKey;
  });

  async function handleDelete(id) {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://18.217.16.106:3001/entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to delete entry.');
        return;
      }

      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      setMessage('Entry deleted successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Could not connect to server.');
    }
  }

  function handleEditClick(entry) {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date?.split('T')[0] || entry.date || '',
      mood: entry.mood || '',
      tag: entry.tag || '',
      note: entry.note || ''
    });
    setMessage('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditForm({
      date: '',
      mood: '',
      tag: '',
      note: ''
    });
    setMessage('');
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSaveEdit(id) {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://18.217.16.106:3001/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to update entry.');
        return;
      }

      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === id ? { ...entry, ...editForm } : entry
        )
      );

      setEditingId(null);
      setMessage('Entry updated successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Could not connect to server.');
    }
  }

  function tileContent({ date, view }) {
    if (view !== 'month') return null;

    const key = date.toISOString().split('T')[0];
    const entry = entriesByDate[key];

    if (!entry) return null;

    const moodInfo = getMoodInfo(entry.mood);

    return (
      <div
        style={{
          marginTop: '4px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: moodInfo.border,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, color: theme.text }}>
      <Navbar theme={theme} themeName={themeName} toggleTheme={toggleTheme} />

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ marginBottom: '24px', color: theme.text }}>History</h1>
        <p style={{ color: theme.subtext, marginBottom: '32px' }}>
          Review and manage your past mood entries.
        </p>

        {message && <p style={{ color: '#7c3aed', fontWeight: 'bold' }}>{message}</p>}

        <div
          className={themeName === 'light' ? 'calendar-light' : 'calendar-dark'}
          style={{
            background: theme.cardBg,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            boxShadow:
            themeName === 'light'
                ? '0 8px 20px rgba(15,23,42,0.08)'
                : '0 10px 25px rgba(0,0,0,0.18)',
            border: `1px solid ${theme.border}`
        }}
        >
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
        </div>

        <h2 style={{ marginBottom: '20px', color: theme.text }}>
          Entries for {selectedDateKey}
        </h2>

        {filteredEntries.length === 0 ? (
          <p style={{ color: theme.subtext }}>No entries for this date.</p>
        ) : (
          filteredEntries.map((entry) => {
            const moodInfo = getMoodInfo(entry.mood);

            return (
              <div
                key={entry.id}
                style={{
                  background: theme.cardBg,
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '18px',
                  boxShadow:
                    themeName === 'light'
                      ? '0 8px 20px rgba(15,23,42,0.08)'
                      : '0 10px 25px rgba(0,0,0,0.18)',
                  border: `1px solid ${theme.border}`,
                  borderLeft: `8px solid ${moodInfo.border}`
                }}
              >
                {editingId === entry.id ? (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: theme.text }}>
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${theme.inputBorder}`,
                          background: theme.inputBg,
                          color: theme.text
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: theme.text }}>
                        Mood
                      </label>
                      <select
                        name="mood"
                        value={editForm.mood}
                        onChange={handleEditChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${theme.inputBorder}`,
                          background: theme.inputBg,
                          color: theme.text
                        }}
                      >
                        <option value="">Select mood</option>
                        <option value="great">😄 Great</option>
                        <option value="good">🙂 Good</option>
                        <option value="okay">😐 Okay</option>
                        <option value="low">😞 Low</option>
                        <option value="bad">😢 Bad</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: theme.text }}>
                        Tag
                      </label>
                      <select
                        name="tag"
                        value={editForm.tag}
                        onChange={handleEditChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${theme.inputBorder}`,
                          background: theme.inputBg,
                          color: theme.text
                        }}
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

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: theme.text }}>
                        Note
                      </label>
                      <textarea
                        name="note"
                        value={editForm.note}
                        onChange={handleEditChange}
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${theme.inputBorder}`,
                          background: theme.inputBg,
                          color: theme.text
                        }}
                      />
                    </div>

                    <button
                      onClick={() => handleSaveEdit(entry.id)}
                      style={{
                        marginRight: '10px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: theme.buttonPrimary,
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>

                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.border}`,
                        background: theme.cardBg,
                        color: theme.text,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: 'inline-block',
                        marginBottom: '12px',
                        padding: '8px 12px',
                        borderRadius: '999px',
                        background: moodInfo.color,
                        border: `2px solid ${moodInfo.border}`,
                        fontWeight: 'bold',
                        color: '#0f172a'
                      }}
                    >
                      {moodInfo.emoji} {moodInfo.label}
                    </div>

                    <p style={{ color: theme.text }}>
                      <strong style={{ color: theme.subtext }}>Date:</strong>{' '}
                      {entry.date?.split('T')[0] || entry.date}
                    </p>
                    <p style={{ color: theme.text }}>
                      <strong style={{ color: theme.subtext }}>Tag:</strong>{' '}
                      {entry.tag || 'None'}
                    </p>
                    <p style={{ color: theme.text }}>
                      <strong style={{ color: theme.subtext }}>Note:</strong>{' '}
                      {entry.note || 'No note'}
                    </p>

                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={() => handleEditClick(entry)}
                        style={{
                          marginRight: '10px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#0f172a',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#ef4444',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default HistoryPage;