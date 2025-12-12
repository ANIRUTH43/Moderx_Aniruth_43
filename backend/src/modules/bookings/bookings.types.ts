export interface Booking {
  id: number;
  show_id: number;
  user_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  expires_at: string | null;
  updated_at: string;
}

export interface BookingWithSeats extends Booking {
  seats: Array<{ id: number; seat_number: string }>;  
}
