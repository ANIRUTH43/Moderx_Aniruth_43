import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config/env';
import showsRoutes from './modules/shows/shows.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import healthRoutes from './modules/health/health.routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.corsOrigin }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use(showsRoutes);
app.use(bookingsRoutes);
app.use(healthRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
