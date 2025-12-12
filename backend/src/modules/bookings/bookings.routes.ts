import { Router } from 'express';
import { bookSeatsHandler, getBookingHandler } from './bookings.controller';

const router = Router();

router.post('/booking', bookSeatsHandler);
router.get('/booking/:id', getBookingHandler);

export default router;
