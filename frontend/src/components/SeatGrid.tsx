import React from 'react';
import { useBooking } from '../context/BookingContext';
import '../styles/SeatGrid.css';

export interface SeatGridProps {
  seats: Array<{
    id: number;
    seat_number: string;
    status: 'AVAILABLE' | 'BOOKED';
  }>;
  totalSeats: number;
}

export const SeatGrid: React.FC<SeatGridProps> = ({ seats, totalSeats }) => {
  const { selectedSeats, toggleSeat } = useBooking();

  const handleSeatClick = (seatId: number, status: string) => {
    if (status === 'AVAILABLE') {
      toggleSeat(seatId);
    }
  };

  // Arrange seats in rows of 10
  const rows = Math.ceil(totalSeats / 10);
  const seatsMap = new Map(seats.map((s) => [s.id, s]));

  return (
    <div className="seat-grid-container">
      <div className="seat-grid">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {Array.from({ length: 10 }).map((_, colIndex) => {
              const seatIndex = rowIndex * 10 + colIndex + 1;
              const seat = seats.find((s) => parseInt(s.seat_number.substring(1)) === seatIndex);

              if (!seat) return null;

              const isSelected = selectedSeats.includes(seat.id);
              const isBooked = seat.status === 'BOOKED';

              return (
                <button
                  key={seat.id}
                  className={`seat ${
                    isBooked ? 'booked' : isSelected ? 'selected' : 'available'
                  }`}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  disabled={isBooked}
                  title={seat.seat_number}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat booked"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};
