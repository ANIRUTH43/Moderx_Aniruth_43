import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { showsApi, bookingsApi } from '../services/api';
import { SeatGrid } from '../components/SeatGrid';

interface ShowDetails {
  show: any;
  seats: any[];
}

const BookingPage = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { selectedSeats, setStatus, setError, status, error, resetBooking } = useBooking();
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!showId) return;
      const result = await showsApi.getShowSeats(parseInt(showId, 10));
      if (result.error) {
        setDetailError(result.error);
      } else if (result.data) {
        setShowDetails(result.data as ShowDetails);
      }
      setLoading(false);
    };

    fetchShowDetails();
  }, [showId]);

  const handleBook = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setStatus('loading');
    const result = await bookingsApi.bookSeats(
      parseInt(showId || '0', 10),
      userId,
      selectedSeats
    );

    if (result.error) {
      setStatus('failed');
      setError(result.error);
    } else if (result.data && typeof result.data === 'object' && 'id' in result.data) {
      setStatus('success');
      const bookingId = (result.data as any).id;
      alert(`Booking successful!\nBooking ID: ${bookingId}\nStatus: CONFIRMED`);
      resetBooking();
      navigate('/');
    }
  };

  if (loading) {
    return <div className="loading">Loading show details...</div>;
  }

  if (detailError) {
    return <div className="error">Error: {detailError}</div>;
  }

  if (!showDetails) {
    return <div className="empty">Show not found</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        ← Back to Shows
      </button>

      <div className="content">
        <h2>{showDetails.show.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {new Date(showDetails.show.start_time).toLocaleString()}
        </p>
      </div>

      <SeatGrid seats={showDetails.seats} totalSeats={showDetails.show.total_seats} />

      <div className="content" style={{ marginTop: '2rem' }}>
        {error && <div className="error">❌ {error}</div>}
        {status === 'success' && (
          <div className="success">✅ Booking confirmed! Redirecting...</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Selected Seats: {selectedSeats.length}</h3>
            <p style={{ color: '#666' }}>
              {selectedSeats.length > 0 
                ? `Seats: ${showDetails.seats
                    .filter(s => selectedSeats.includes(s.id))
                    .map(s => s.seat_number)
                    .join(', ')}`
                : 'No seats selected'}
            </p>
          </div>
          <button
            onClick={handleBook}
            disabled={selectedSeats.length === 0 || status === 'loading'}
            className="btn btn-success"
            style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
          >
            {status === 'loading' ? 'Booking...' : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
