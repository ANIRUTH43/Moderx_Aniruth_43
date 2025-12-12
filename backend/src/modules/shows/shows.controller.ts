import { Request, Response } from 'express';
import { createShow, getShows, getShowById, getShowSeats } from './shows.service';

export const createShowHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, start_time, total_seats } = req.body;

    if (!name || !start_time || !total_seats) {
      res.status(400).json({ error: 'Missing required fields: name, start_time, total_seats' });
      return;
    }

    const show = await createShow(name, start_time, total_seats);
    res.status(201).json({ success: true, data: show });
  } catch (error: any) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: 'Failed to create show', message: error.message });
  }
};

export const getShowsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const shows = await getShows();
    res.json({ success: true, data: shows });
  } catch (error: any) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows', message: error.message });
  }
};

export const getShowSeatsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const showId = parseInt(id, 10);

    if (isNaN(showId)) {
      res.status(400).json({ error: 'Invalid show ID' });
      return;
    }

    const show = await getShowById(showId);
    if (!show) {
      res.status(404).json({ error: 'Show not found' });
      return;
    }

    const seats = await getShowSeats(showId);
    res.json({ success: true, data: { show, seats } });
  } catch (error: any) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats', message: error.message });
  }
};
