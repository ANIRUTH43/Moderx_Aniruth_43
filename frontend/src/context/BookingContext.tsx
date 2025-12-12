import React, { createContext, useContext, useState } from 'react';

export interface BookingData {
  id: number;
  show_id: number;
  user_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  seats: Array<{ id: number; seat_number: string }>;
  created_at: string;
  expires_at: string | null;
}

type BookingStatus = 'idle' | 'loading' | 'success' | 'failed';

interface BookingContextType {
  currentBooking: BookingData | null;
  status: BookingStatus;
  error: string | null;
  selectedSeats: number[];
  setSelectedSeats: (seats: number[]) => void;
  toggleSeat: (seatId: number) => void;
  setCurrentBooking: (booking: BookingData | null) => void;
  setStatus: (status: BookingStatus) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null);
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const toggleSeat = (seatId: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const resetBooking = () => {
    setCurrentBooking(null);
    setStatus('idle');
    setError(null);
    setSelectedSeats([]);
  };

  return (
    <BookingContext.Provider
      value={{
        currentBooking,
        status,
        error,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        setCurrentBooking,
        setStatus,
        setError,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
