import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import JournalPage from './pages/JournalPage';
import HistoryPage from './pages/HistoryPage';
import { themes } from './theme';

function App() {
  const token = localStorage.getItem('token');
  const [themeName, setThemeName] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  const theme = themes[themeName];

  function toggleTheme() {
    setThemeName((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Navigate to="/journal" />
          ) : (
            <LoginPage theme={theme} themeName={themeName} toggleTheme={toggleTheme} />
          )
        }
      />
      <Route
        path="/journal"
        element={
          token ? (
            <JournalPage theme={theme} themeName={themeName} toggleTheme={toggleTheme} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/history"
        element={
          token ? (
            <HistoryPage theme={theme} themeName={themeName} toggleTheme={toggleTheme} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default App;