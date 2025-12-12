export interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
  created_at: string;
  updated_at: string;
}

export interface Seat {
  id: number;
  show_id: number;
  seat_number: string;
  status: 'AVAILABLE' | 'BOOKED';
  created_at: string;
  updated_at: string;
}
