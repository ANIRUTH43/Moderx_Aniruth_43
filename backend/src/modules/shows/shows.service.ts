import pool from '../../db/pool';
import { Show, Seat } from './shows.types';

export const createShow = async (name: string, startTime: string, totalSeats: number): Promise<Show> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert show
    const showRes = await client.query(
      'INSERT INTO shows (name, start_time, total_seats) VALUES ($1, $2, $3) RETURNING *',
      [name, startTime, totalSeats]
    );
    const show = showRes.rows[0];

    // Generate and insert seats
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `S${i}`;
      seats.push([show.id, seatNumber]);
    }

    for (const [showId, seatNumber] of seats) {
      await client.query(
        'INSERT INTO seats (show_id, seat_number, status) VALUES ($1, $2, $3)',
        [showId, seatNumber, 'AVAILABLE']
      );
    }

    await client.query('COMMIT');
    return show;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getShows = async (): Promise<Show[]> => {
  const res = await pool.query('SELECT * FROM shows ORDER BY created_at DESC');
  return res.rows;
};

export const getShowById = async (id: number): Promise<Show | null> => {
  const res = await pool.query('SELECT * FROM shows WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const getShowSeats = async (showId: number): Promise<Seat[]> => {
  const res = await pool.query(
    'SELECT * FROM seats WHERE show_id = $1 ORDER BY seat_number',
    [showId]
  );
  return res.rows;
};
