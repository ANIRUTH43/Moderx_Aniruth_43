# Ticket Booking System - Setup & Deployment Guide

## 📋 Project Overview

A production-ready full-stack ticket booking system with **strict concurrency control** using PostgreSQL transactions and row-level locking to prevent overbooking when multiple users book simultaneously.

**Tech Stack:**
- Backend: Node.js, Express.js, PostgreSQL with transaction locking
- Frontend: React 18 + TypeScript, Vite
- Concurrency: SELECT ... FOR UPDATE with SERIALIZABLE isolation level

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Setup Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE ticket_booking;"

# Run migrations (SQL file exists at: backend/src/db/migrations/001_init.sql)
psql -U postgres -d ticket_booking -f backend/src/db/migrations/001_init.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create/update .env file
# DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ticket_booking
# PORT=5000
# CORS_ORIGIN=http://localhost:5173

# Run development server
npm run dev
# Server starts at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
# Frontend opens at http://localhost:5173
```

### 4. Test the Application

1. Open http://localhost:5173
2. Click "Switch to Admin" in top navigation
3. Create a show with 50 seats
4. Switch back to User
5. Click "Book Tickets" and select seats
6. Submit booking - notice concurrency protection prevents overbooking!

---

## 🏗️ Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── server.ts           # Server & graceful shutdown
│   │   ├── config/env.ts       # Environment config
│   │   ├── db/
│   │   │   ├── pool.ts         # PostgreSQL connection pool
│   │   │   └── migrations/
│   │   │       └── 001_init.sql # Database schema
│   │   └── modules/
│   │       ├── shows/          # Shows CRUD operations
│   │       ├── bookings/       # Booking with SERIALIZABLE transactions
│   │       └── health/         # Health check endpoint
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── App.tsx             # Router setup
│   │   ├── context/            # Auth, Shows, Booking contexts
│   │   ├── routes/             # Pages (Shows, Admin, Booking)
│   │   ├── components/         # SeatGrid, ShowCard components
│   │   ├── services/api.ts     # Centralized API client
│   │   └── styles/             # CSS (Tailwind-inspired)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env
└── SETUP_GUIDE.md
```

---

## 🔐 Critical: Concurrency Control Implementation

### How Overbooking is Prevented

The backend uses **PostgreSQL SERIALIZABLE isolation level** with **row-level locking**:

```typescript
// In bookings.service.ts: bookSeats()
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

const lockQuery = `
  SELECT id, status FROM seats 
  WHERE id = ANY($1) AND show_id = $2 
  FOR UPDATE
`;
const lockedSeats = await client.query(lockQuery, [seatIds, showId]);

// Verify all seats are AVAILABLE before proceeding
// If any seat is BOOKED, ROLLBACK transaction (409 Conflict)

// Mark seats as BOOKED in same transaction
await client.query('UPDATE seats SET status = 'BOOKED' WHERE id = ANY($1)', [seatIds]);
await client.query('COMMIT');
```

**Why this works:**
- `SELECT ... FOR UPDATE`: Locks rows until transaction commits
- `SERIALIZABLE`: Prevents race conditions even with overlapping transactions
- All-or-nothing: Either entire booking succeeds or fails atomically
- No double-bookings: Even with simultaneous requests

### Testing Concurrency

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Run concurrent booking test (pseudo-code)
# Use curl or Postman to send multiple booking requests simultaneously
curl -X POST http://localhost:5000/booking \
  -H "Content-Type: application/json" \
  -d '{"show_id": 1, "user_id": "user1", "seat_ids": [1, 2, 3]}'

# Try booking same seats from another user concurrently
# Expected: First succeeds, second gets 409 Conflict
```

---

## 📊 API Endpoints

### Shows
- `POST /admin/shows` - Create show (admin)
- `GET /admin/shows` - List shows (admin)
- `GET /shows` - List shows (public)
- `GET /shows/:id/seats` - Get seats for show

### Bookings (with concurrency control)
- `POST /booking` - Book seats (SERIALIZABLE transaction)
- `GET /booking/:id` - Get booking details

### Health
- `GET /health` - Health check with DB connection status

---

## 🚢 Deployment

### Backend - Deploy to Render or Railway

**1. Prepare for deployment:**
```bash
cd backend
npm run build
```

**2. Create .env.production:**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/ticket_booking
CORS_ORIGIN=https://your-frontend-domain.com
```

**3. Deploy to Render (recommended):**

- Push code to GitHub
- New Blueprint -> Node
- Connect repo
- Set environment variables
- Build: `npm install && npm run build`
- Start: `npm start`
- Database: Use Render PostgreSQL add-on
- Run migrations after deployment

**4. Deploy to Railway:**

- Connect GitHub repo
- Railway auto-detects Node.js
- Add PostgreSQL plugin
- Set DATABASE_URL env var
- Deploy

### Frontend - Deploy to Vercel or Netlify

**1. Build:**
```bash
cd frontend
npm run build
```

**2. Vercel (recommended):**

- Push to GitHub
- Connect repo to Vercel
- Set `VITE_API_BASE_URL` env var to backend URL
- Auto-deploys on push

**3. Netlify:**

- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist`
- Set `VITE_API_BASE_URL` in environment variables

---

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development                                    # or production
PORT=5000
DATABASE_URL=postgres://user:pass@localhost:5432/ticket_booking
CORS_ORIGIN=http://localhost:5173                       # Frontend URL
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000                 # Backend URL
```

---

## 🧪 Testing Concurrency Scenarios

### Scenario: Overbooking Prevention

**Setup:**
- Show with 50 seats
- User A tries to book seats 1-10
- User B tries to book seats 1-10 simultaneously

**Expected:**
- One user succeeds (CONFIRMED, 201)
- Other user gets Conflict error (409)

**Code in bookings.service.ts handles this:**
```typescript
if (!allAvailable) {
  await client.query('ROLLBACK');
  return {
    error: 'Some seats are already booked',
    status: 409,  // Conflict
  };
}
```

### Scenario: Booking Expiry (Bonus Feature)

Pending bookings older than 2 minutes are automatically released:

```typescript
// In server.ts: runs every 60 seconds
setInterval(() => {
  cleanupExpiredBookings();
}, 60000);

// In bookings.service.ts
const expiredRes = await client.query(
  `SELECT id FROM bookings WHERE status = 'PENDING' AND expires_at < now()`
);
// Release seats and mark booking as FAILED
```

---

## 📈 Performance Optimizations

1. **Connection Pooling:** PostgreSQL connection pool (max 20)
2. **Indexes:** On `show_id`, `user_id`, `status`, `expires_at`
3. **Caching:** React Context caches shows list
4. **Lazy Loading:** Seats loaded on demand per show
5. **Memoization:** Components use React.FC with proper deps

---

## 🐛 Troubleshooting

### "Connection refused" on backend
- Ensure PostgreSQL is running: `sudo systemctl start postgresql`
- Check DATABASE_URL is correct
- Verify DB exists: `psql -l`

### "CORS errors" when frontend calls backend
- Check CORS_ORIGIN env var matches frontend URL
- Ensure backend is running
- Check network tab in DevTools

### "Seats not updating" in UI
- Refresh page to fetch latest seat status
- Check browser console for errors
- Verify backend API is responding: `curl http://localhost:5000/health`

### Database migration failed
- Drop and recreate: `dropdb ticket_booking && createdb ticket_booking`
- Run migration again: `psql ... -f 001_init.sql`

---

## 📝 Database Schema Summary

```sql
shows (id, name, start_time, total_seats, created_at, updated_at)
seats (id, show_id, seat_number, status: AVAILABLE|BOOKED, created_at, updated_at)
bookings (id, show_id, user_id, status: PENDING|CONFIRMED|FAILED, created_at, expires_at, updated_at)
booking_seats (id, booking_id, seat_id, created_at)
```

---

## 🎯 Next Steps & Enhancements

- [ ] Add authentication (JWT)
- [ ] Implement WebSocket for real-time seat updates
- [ ] Add payment integration (Stripe)
- [ ] Email notifications for bookings
- [ ] Admin dashboard with analytics
- [ ] User booking history
- [ ] Refund/cancellation flow
- [ ] Multiple seat categories (VIP, Regular, Balcony)
- [ ] Unit/E2E tests with Jest and Cypress

---

## 📞 Support

For issues or questions:
1. Check database connection: `SELECT NOW();` in psql
2. Check backend logs: `npm run dev` output
3. Check network requests: Browser DevTools Network tab
4. Verify all files were created in correct structure

