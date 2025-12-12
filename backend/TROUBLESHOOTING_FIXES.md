# Ticket Booking System - Troubleshooting & Fixes

## Issue: AggregateError on Backend Startup

**Error Message:**
```
AggregateError:
  at processTicksAndRejections (node:internal/process/task_queues:103:5)
  at cleanupExpiredBookings (/workspaces/Moderx_Aniruth_43/backend/src/modules/bookings/bookings.service.ts:125:18)
```

**Root Cause:**
PostgreSQL database was not running or the DATABASE_URL was not properly configured. The pg-pool was trying to connect on startup and failing.

---

## Fixes Applied

### 1. ✅ Updated `backend/src/db/pool.ts`

**Changes:**
- Added warning message if DATABASE_URL is not set
- Made connection timeout more generous (5 seconds instead of 2 seconds)
- Made database connection test non-blocking (wrapped in setTimeout)
- Added better error messages to guide users
- Pool error handler no longer crashes the entire server

**Before:**
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**After:**
```typescript
const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,  // Increased timeout
  statement_timeout: 30000,        // Added statement timeout
});

// Non-blocking connection test
setTimeout(() => {
  pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connection successful!'))
    .catch((err) => console.error('❌ Database connection failed:', err.message));
}, 500);
```

### 2. ✅ Updated `backend/src/config/env.ts`

**Changes:**
- Made DATABASE_URL optional (no longer throws error if missing)
- Server can now start without database configured

**Before:**
```typescript
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}
```

**After:**
```typescript
databaseUrl: string | undefined;  // Now optional
```

### 3. ✅ Updated `backend/src/app.ts`

**Changes:**
- Added better error handling in middleware
- Stack traces only shown in development mode
- 404 and error handlers won't crash the server

### 4. ✅ Updated `backend/src/modules/bookings/bookings.service.ts`

**Changes:**
- Added try-catch for cleanup operations
- Better error messages for SERIALIZATION_FAILURE
- Graceful handling of rollback errors

---

## How to Fix Database Connection

### Option 1: Use PostgreSQL Locally (Recommended for Development)

```bash
# 1. Start PostgreSQL (if not running)
sudo systemctl start postgresql

# 2. Create the database
sudo -u postgres psql -c "CREATE DATABASE ticket_booking;"

# 3. Run migrations
psql -U postgres -d ticket_booking -f backend/src/db/migrations/001_init.sql

# 4. Update .env file
echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/ticket_booking" > backend/.env

# 5. Start backend
cd backend && npm run dev
```

### Option 2: Use Cloud Database (Supabase/Railway)

```bash
# 1. Create account on Supabase or Railway
# 2. Get connection string from dashboard
# 3. Update .env
echo "DATABASE_URL=<your-cloud-database-url>" > backend/.env

# 4. Run migrations on cloud database
psql "<your-cloud-database-url>" -f backend/src/db/migrations/001_init.sql

# 5. Start backend
cd backend && npm run dev
```

### Option 3: Skip Database for Testing Frontend Only

```bash
# The server will start without DATABASE_URL
# Frontend will still work
# API calls will fail with proper error messages
cd backend && npm run dev
```

---

## Verification Checklist

After applying fixes, verify:

```bash
# 1. Check backend starts without crashing
cd backend && npm run dev
# Expected: Server running on port 5000
# Status: OK if no AggregateError

# 2. Check health endpoint
curl http://localhost:5000/health
# Expected: JSON response with status

# 3. If DATABASE_URL is set, verify connection:
curl http://localhost:5000/health | grep "database"
# Expected: "database": "connected" or "Database connection successful"

# 4. Test shows endpoint (will fail if no DB, but no crash)
curl http://localhost:5000/shows
# Expected: Error message (not server crash)

# 5. Start frontend
cd frontend && npm run dev
# Expected: Frontend loads at http://localhost:5173
```

---

## Common Errors & Solutions

### Error: "ECONNREFUSED 127.0.0.1:5432"
**Solution:** PostgreSQL not running
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Error: "could not translate host name 'localhost' to address"
**Solution:** DATABASE_URL format incorrect
```bash
# Wrong: postgres://localhost:5432/ticket_booking
# Right: postgresql://postgres:password@localhost:5432/ticket_booking
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_booking"
```

### Error: "database 'ticket_booking' does not exist"
**Solution:** Database not created
```bash
sudo -u postgres psql -c "CREATE DATABASE ticket_booking;"
psql -U postgres -d ticket_booking -f backend/src/db/migrations/001_init.sql
```

### Error: "role 'postgres' is not permitted to log in"
**Solution:** PostgreSQL role issue
```bash
sudo -u postgres psql -c "ALTER ROLE postgres WITH LOGIN;"
```

---

## Database Setup Script (One-Liner)

```bash
# Run all setup commands at once
sudo systemctl start postgresql && \
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS ticket_booking;" && \
psql -U postgres -d ticket_booking -f backend/src/db/migrations/001_init.sql && \
echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/ticket_booking" > backend/.env && \
echo "✅ Database setup complete!"
```

---

## Testing Without PostgreSQL

If you don't have PostgreSQL installed, the backend will start but database operations will fail:

```bash
# Backend starts successfully
✅ Ticket Booking Backend Server
   Running on port: 5000
   Environment: DEVELOPMENT

# Health check shows disconnected
❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:5432

# Frontend still works at http://localhost:5173
# API calls will fail with proper error messages
# This is OK for development/testing frontend only
```

---

## Files Modified

1. `backend/src/db/pool.ts` - Better connection handling
2. `backend/src/config/env.ts` - Optional DATABASE_URL
3. `backend/src/app.ts` - Better error handling
4. `backend/src/modules/bookings/bookings.service.ts` - Graceful error handling

## Files Created

1. `TROUBLESHOOTING_FIXES.md` - This file

---

## Next Steps

1. **Setup PostgreSQL** (see above)
2. **Start Backend:** `cd backend && npm run dev`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Test Application:** http://localhost:5173

---

## Support

If you continue to see errors:

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify DATABASE_URL: `echo $DATABASE_URL`
3. Test connection manually: `psql "$DATABASE_URL"`
4. Check backend logs: Look at terminal output from `npm run dev`
5. Check frontend network requests: Browser DevTools > Network tab

