# Database Schema Fix Instructions

## Issue
The application is failing because the `strategyId` column doesn't exist in the database but is referenced in the Prisma schema.

## Fix Applied to Code
✅ Commented out the `strategyId` field and relation in `prisma/schema.prisma`

## Required Actions

### Step 1: Stop the Development Server
Stop your running `npm run dev` or `next dev` process.

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 3: Restart the Development Server
```bash
npm run dev
```

### Step 4: Test the APIs
```bash
node scripts/test-trades-and-strategies.js
```

## Expected Results After Fix

✅ **Strategies API**: Working correctly (already tested)
✅ **Trades API**: Should work after Prisma client regeneration
✅ **Trades Creation**: Should work after Prisma client regeneration

## Long-term Solution

To fully support the `strategyId` column, you need to:

1. Run the migration SQL to add missing columns to your database:
   ```sql
   -- Run the SQL in scripts/fix-database-columns.sql
   ```

2. Uncomment the `strategyId` field in `prisma/schema.prisma`

3. Uncomment the relation in the Trade model

4. Regenerate Prisma client and restart

## Quick Test Results

**Current Status:**
- ✅ Strategies: Fetch works, Create fails due to unique constraint (expected)
- ❌ Trades: Fails because Prisma client needs regeneration

**After fixing:**
- ✅ All APIs should work correctly

