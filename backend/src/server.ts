import app from './app';
import config from './config/env';
import { cleanupExpiredBookings } from './modules/bookings/bookings.service';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  Ticket Booking Backend Server         ║`);
  console.log(`║  Running on port: ${PORT.toString().padEnd(27, ' ')}║`);
  console.log(`║  Environment: ${config.nodeEnv.toUpperCase().padEnd(23, ' ')}║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

// Setup periodic cleanup of expired bookings (every 1 minute)
setInterval(() => {
  cleanupExpiredBookings();
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;
