import { Router } from 'express';
import { createShowHandler, getShowsHandler, getShowSeatsHandler } from './shows.controller';

const router = Router();

router.post('/admin/shows', createShowHandler);
router.get('/admin/shows', getShowsHandler);
router.get('/shows', getShowsHandler);
router.get('/shows/:id/seats', getShowSeatsHandler);

export default router;
