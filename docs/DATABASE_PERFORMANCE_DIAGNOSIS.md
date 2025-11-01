# Database Performance Diagnosis Guide

## Problem
Dashboard takes **7 seconds** to load data from database, which is too slow.

## Diagnosis Tools Added

### 1. Query Performance Monitoring ✅
**File:** `lib/prisma.ts`

- Added automatic query timing
- Logs slow queries (>1000ms)
- Logs all queries in development mode
- Helps identify which queries are slow

**Usage:** Check console logs for `[Prisma Query]` messages

### 2. Performance Timing ✅
**Files:** `server/database.ts`, `server/user-data.ts`

- Added timing to `getTradesAction`
- Added timing to `getUserData` transactions
- Warns if queries take >2-3 seconds
- Helps identify bottlenecks

### 3. Database Debug API ✅
**File:** `app/api/db/debug/route.ts`

**Usage:**
```bash
# Test all queries
GET /api/db/debug?type=all

# Test trades query only
GET /api/db/debug?type=trades

# Test userData query only
GET /api/db/debug?type=userData
```

This will show:
- Connection latency
- Query execution times
- Row counts
- Average time per trade

## Common Causes of 7-Second Load Times

### 1. **Missing Indexes** (Most Likely)
**Problem:** Queries doing full table scans
**Solution:** Add composite indexes (see `prisma/migrations/add_composite_indexes.sql`)

**Check:**
- Run `/api/db/debug` to see query times
- Check if count query is slow (>1s)
- Check if findMany is slow (>2s)

### 2. **Large Dataset**
**Problem:** User has 10,000+ trades
**Solution:**
- Already optimized with pagination and field selection
- Consider limiting initial load to recent trades
- Add date-based filtering by default

### 3. **Database Connection Issues**
**Problem:**
- Cold connection (first query after idle)
- No connection pooling
- Network latency to database

**Check:**
- Connection latency in `/api/db/debug`
- Should be <100ms
- If >500ms, database is slow or far away

**Solution:**
- Ensure DATABASE_URL uses connection pooling (port 6543 for Supabase)
- Add `?pgbouncer=true` if using PgBouncer
- Use direct connection for better performance (port 5432)

### 4. **Slow Transaction**
**Problem:** Large transaction locking tables
**Solution:**
- Already optimized to parallel queries where possible
- Added timeout (10s) to prevent hanging

### 5. **Cold Start (Vercel)**
**Problem:** Serverless function cold start
**Solution:**
- Prefetching helps (already implemented)
- Keep functions warm with scheduled pings
- Consider edge caching

## Diagnosis Steps

### Step 1: Check Query Performance
```bash
# In browser console or terminal
curl http://localhost:3000/api/db/debug?type=all
```

**Look for:**
- `connectionLatency`: Should be <100ms
- `trades.queryTime`: Should be <2000ms for 1000 trades
- `userData.queryTime`: Should be <1000ms

### Step 2: Check Console Logs
Look for these warnings:
- `[getTrades] SLOW QUERY: Took Xms`
- `[getUserData] SLOW TRANSACTION: Took Xms`
- `[Prisma Query] Trade.findMany took Xms`

### Step 3: Check Database Connection
**If using Supabase:**
- **Connection Pooling**: Use port `6543` → `?pgbouncer=true`
- **Direct Connection**: Use port `5432` → Better performance, more connections

**Format:**
```
# Pooling (recommended for serverless)
postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1

# Direct (better performance)
postgresql://user:pass@host:5432/db?connection_limit=5
```

### Step 4: Check Indexes
Run this SQL in your database:
```sql
-- Check if indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'Trade'
    AND schemaname = 'public'
ORDER BY indexname;
```

**Should have:**
- `Trade_userId_idx` ✅
- `Trade_entryDate_idx` ✅
- `Trade_userId_entryDate_idx` (composite - add this!)

## Quick Fixes

### Fix 1: Add Composite Index (Recommended)
Run the migration:
```sql
-- See prisma/migrations/add_composite_indexes.sql
CREATE INDEX IF NOT EXISTS "Trade_userId_entryDate_idx" 
ON "Trade"("userId", "entryDate" DESC);
```

**Expected improvement:** 50-70% faster queries

### Fix 2: Optimize DATABASE_URL
If using Supabase:
- Switch to **direct connection** (port 5432) instead of pooling
- Add `connection_limit=5` to connection string

### Fix 3: Skip Count Query for Small Datasets
**Already implemented**: Count is only used to determine pagination
- For <5000 trades: No count needed (fixed)

### Fix 4: Limit Initial Load
Add date-based default filter:
```typescript
// Only load last 90 days by default
const ninetyDaysAgo = new Date()
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
query.where.entryDate = { gte: ninetyDaysAgo.toISOString() }
```

## Expected Performance After Fixes

| Metric | Current | After Indexes | After All Fixes |
|--------|---------|---------------|-----------------|
| Connection | ? | <100ms | <100ms |
| Count Query | ? | <500ms | <200ms |
| FindMany (1000 trades) | ? | <1000ms | <500ms |
| Total Load | 7s | 2-3s | <1s |

## Next Steps

1. **Run `/api/db/debug`** to see actual query times
2. **Check console logs** for slow query warnings
3. **Add composite indexes** (biggest win)
4. **Optimize DATABASE_URL** if needed
5. **Consider limiting initial load** to recent trades

## Monitoring

After deploying fixes:
- Monitor `/api/db/debug` endpoint
- Check Vercel logs for slow query warnings
- Track average query times in production


