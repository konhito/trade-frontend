# Push Schema Instructions

## Current Status
✅ Schema updated in code (historicalData field added to Strategy model)  
❌ Schema not pushed to database yet (dev server is running)

## How to Push Schema

### Step 1: Stop Dev Server
In the terminal where `npm run dev` is running:
- Press **Ctrl+C** to stop it

### Step 2: Push Schema
Run one of these:
```bash
node push-schema.js
```
OR
```bash
npx prisma db push --accept-data-loss
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

## What Gets Added
The `historicalData` JSON column will be added to the `Strategy` table, allowing you to:
- Click Upload button on strategies
- Import backtest vs live comparison data
- Store historical performance data

## Testing After Push
Run this to verify:
```bash
node test-schema.js
```

## Scripts Created
- `push-schema.js` - Loads .env and pushes schema
- `test-schema.js` - Tests if schema was updated
- `push-db-only.js` - Simple push (already created)
- `push-database.bat` - Windows batch file

## Quick Command
```bash
# 1. Stop dev server (Ctrl+C)
# 2. Run:
node push-schema.js
# 3. Restart:
npm run dev
```

