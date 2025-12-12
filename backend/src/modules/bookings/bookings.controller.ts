import { Request, Response } from 'express';
import { bookSeats, getBooking } from './bookings.service';

export const bookSeatsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { show_id, user_id, seat_ids } = req.body;

    if (!show_id || !user_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      res.status(400).json({
        error: 'Missing required fields: show_id, user_id, seat_ids (non-empty array)',
      });
      return;
    }

    const result = await bookSeats(show_id, user_id, seat_ids);

    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.status(result.status).json({
      success: true,
      data: result.booking,
    });
  } catch (error: any) {
    console.error('Error booking seats:', error);
    res.status(500).json({
      error: 'Failed to book seats',
      message: error.message,
    });
  }
};

export const getBookingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message,
    });
  }
};
