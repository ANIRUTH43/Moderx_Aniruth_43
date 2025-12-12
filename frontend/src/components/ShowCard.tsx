import React from 'react';
import { Link } from 'react-router-dom';
import { Show } from '../context/ShowContext';
import '../styles/ShowCard.css';

interface ShowCardProps {
  show: Show;
}

export const ShowCard: React.FC<ShowCardProps> = ({ show }) => {
  const startDate = new Date(show.start_time).toLocaleDateString();
  const startTime = new Date(show.start_time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="show-card">
      <div className="show-card-header">
        <h3>{show.name}</h3>
      </div>
      <div className="show-card-body">
        <p>
          <strong>Date:</strong> {startDate}
        </p>
        <p>
          <strong>Time:</strong> {startTime}
        </p>
        <p>
          <strong>Total Seats:</strong> {show.total_seats}
        </p>
      </div>
      <div className="show-card-footer">
        <Link to={`/booking/${show.id}`} className="btn btn-primary">
          Book Tickets
        </Link>
      </div>
    </div>
  );
};
