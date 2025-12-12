import pool from '../../db/pool';
import { Booking, BookingWithSeats } from './bookings.types';

/**
 * CRITICAL: Book seats with strict concurrency control using PostgreSQL transactions and row locks.
 * This prevents overbooking when multiple users try to book the same seats simultaneously.
 */
export const bookSeats = async (
  showId: number,
  userId: string,
  seatIds: number[]
): Promise<{ booking: Booking; status: number } | { error: string; status: number }> => {
  const client = await pool.connect();
  try {
    // 1. BEGIN transaction with serializable isolation to prevent race conditions
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // 2. Lock seat rows using SELECT ... FOR UPDATE
    // This ensures no other transaction can modify these seats until we commit
    const lockQuery = `
      SELECT id, status FROM seats 
      WHERE id = ANY($1) AND show_id = $2 
      FOR UPDATE
    `;
    const lockedSeatsRes = await client.query(lockQuery, [seatIds, showId]);
    const lockedSeats = lockedSeatsRes.rows;

    // 3. Verify we got exactly the right number of seats
    if (lockedSeats.length !== seatIds.length) {
      await client.query('ROLLBACK');
      return {
        error: 'Some seats do not exist',
        status: 404,
      };
    }

    // 4. Verify all seats are AVAILABLE
    const allAvailable = lockedSeats.every((seat: any) => seat.status === 'AVAILABLE');
    if (!allAvailable) {
      await client.query('ROLLBACK');
      return {
        error: 'Some seats are already booked',
        status: 409,
      };
    }

    // 5. Create booking record
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    const bookingRes = await client.query(
      `INSERT INTO bookings (show_id, user_id, status, expires_at) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [showId, userId, 'CONFIRMED', expiresAt]
    );
    const booking = bookingRes.rows[0];

    // 6. Insert booking_seats relationships
    for (const seatId of seatIds) {
      await client.query(
        `INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)`,
        [booking.id, seatId]
      );
    }

    // 7. Mark seats as BOOKED
    await client.query(
      `UPDATE seats SET status = 'BOOKED' WHERE id = ANY($1)`,
      [seatIds]
    );

    // 8. COMMIT transaction - all or nothing atomicity
    await client.query('COMMIT');

    return {
      booking,
      status: 201,
    };
  } catch (err: any) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    console.error('Booking error:', err);
    return {
      error: err.message || 'Booking failed',
      status: 500,
    };
  } finally {
    client.release();
  }
};

export const getBooking = async (bookingId: number): Promise<BookingWithSeats | null> => {
  try {
    const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0) return null;

    const booking = bookingRes.rows[0];

    const seatsRes = await pool.query(
      `SELECT s.id, s.seat_number FROM booking_seats bs
       JOIN seats s ON bs.seat_id = s.id
       WHERE bs.booking_id = $1`,
      [bookingId]
    );

    return {
      ...booking,
      seats: seatsRes.rows,
    };
  } catch (err) {
    console.error('Error fetching booking:', err);
    return null;
  }
};

/**
 * OPTIONAL BONUS: Clean up expired pending bookings (run periodically)
 */
export const cleanupExpiredBookings = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find expired pending bookings
    const expiredRes = await client.query(
      `SELECT id FROM bookings WHERE status = 'PENDING' AND expires_at < now()`
    );

    for (const row of expiredRes.rows) {
      const bookingId = row.id;

      // Release seats
      await client.query(
        `UPDATE seats SET status = 'AVAILABLE' 
         WHERE id IN (SELECT seat_id FROM booking_seats WHERE booking_id = $1)`,
        [bookingId]
      );

      // Mark booking as failed
      await client.query(
        `UPDATE bookings SET status = 'FAILED' WHERE id = $1`,
        [bookingId]
      );
    }

    await client.query('COMMIT');
    console.log(`Cleaned up ${expiredRes.rows.length} expired bookings`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cleanup error:', err);
  } finally {
    client.release();
  }
};
