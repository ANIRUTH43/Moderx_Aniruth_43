import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShowProvider } from './context/ShowContext';
import { BookingProvider } from './context/BookingContext';
import ShowsListPage from './routes/ShowsListPage';
import AdminPage from './routes/AdminPage';
import BookingPage from './routes/BookingPage';

const AppContent = () => {
  const { role, toggleRole } = useAuth();

  return (
    <Router>
      <div>
        <header className="header">
          <div className="header-content">
            <div>
              <h1>🎟️ Ticket Booking System</h1>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                Fast, Reliable, Concurrent Seat Bookings
              </p>
            </div>
            <nav className="header-nav">
              <Link to="/">Browse Shows</Link>
              {role === 'ADMIN' && <Link to="/admin">Admin Panel</Link>}
              <button
                onClick={toggleRole}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {role === 'ADMIN' ? 'Switch to User' : 'Switch to Admin'}
              </button>
            </nav>
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<ShowsListPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/booking/:showId" element={<BookingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ShowProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </ShowProvider>
    </AuthProvider>
  );
}

export default App;
