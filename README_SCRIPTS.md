# Database Scripts Documentation

## Available Scripts

### 1. Quick Push (Recommended for Development)
```bash
node scripts/quick-push.js
```
**What it does:**
- Generates Prisma Client
- Pushes schema changes directly to database
- Adds missing columns automatically

**Use when:** You're developing and want to quickly update the schema

---

### 2. Push with User Prompt
```bash
node scripts/push-schema-to-db.js
```
**What it does:**
- Checks if .env file exists
- Verifies migration status
- Prompts for confirmation
- Pushes schema changes to database
- Provides detailed feedback

**Use when:** You want more control and feedback

---

### 3. Create Migration (Recommended for Production)
```bash
node scripts/push-with-migration.js
```
**What it does:**
- Creates a new migration file
- Applies the migration to your database
- Tracks changes in git (migration files)

**Use when:** You're deploying to production or want to track changes in git

---

### 4. Test APIs
```bash
node scripts/test-trades-and-strategies.js
```
**What it does:**
- Tests fetching trades
- Tests creating a new trade
- Tests fetching strategies  
- Tests creating a new strategy
- Provides detailed test results

**Use when:** You want to verify everything is working after schema changes

---

### 5. Check Database
```bash
node scripts/check-and-fix-database.js
```
**What it does:**
- Lists all tables in database
- Checks Trade table columns
- Identifies missing columns
- Provides SQL to fix issues

**Use when:** You want to diagnose schema issues

---

### 6. Check Tables
```bash
node scripts/check-database-tables.js
```
**What it does:**
- Lists all tables in the public schema
- Shows Trade table structure
- Checks for missing columns

**Use when:** You want a quick overview of your database

---

## Quick Start Workflow

### First Time Setup
```bash
# 1. Make sure you have .env file with DATABASE_URL
cp env.template .env
# Edit .env with your database credentials

# 2. Push schema to database
node scripts/quick-push.js

# 3. Test the APIs
node scripts/test-trades-and-strategies.js
```

### After Schema Changes
```bash
# 1. Push changes to database
node scripts/quick-push.js

# 2. Restart your dev server (if running)
# Ctrl+C to stop, then: npm run dev

# 3. Test the changes
node scripts/test-trades-and-strategies.js
```

### For Production
```bash
# 1. Create migration
node scripts/push-with-migration.js

# 2. Commit migration files to git
git add prisma/migrations/
git commit -m "Add missing trade columns"

# 3. Deploy and run migrations
npm run deploy
```

---

## Troubleshooting

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:** Create a `.env` file in the root directory with your database URL
```bash
cp env.template .env
# Edit .env with your credentials
```

### Issue: "The column Trade.strategyId does not exist"
**Solution:** The schema has been updated to comment out the strategyId field. Run:
```bash
node scripts/quick-push.js
```

### Issue: "EPERM: operation not permitted"
**Solution:** Close your development server and any other processes using the database, then run the script again

### Issue: "Unique constraint failed"
**Solution:** The test data already exists. This is expected behavior - the test script now uses unique names

---

## Direct Prisma Commands

If you prefer using Prisma CLI directly:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (auto-create missing columns)
npx prisma db push --accept-data-loss

# Create migration
npx prisma migrate dev --name migration_name

# Check migration status
npx prisma migrate status

# Reset database (WARNING: This deletes all data!)
npx prisma migrate reset
```

---

## SQL Scripts

### Fix Missing Columns Manually
If the scripts don't work, you can run the SQL directly:

```bash
# Using the provided SQL script
psql $DATABASE_URL -f scripts/fix-database-columns.sql

# Or manually execute in your database client
# Open scripts/fix-database-columns.sql and run the SQL
```

---

## Next Steps After Running Scripts

1. **Restart your dev server** if it's running
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Test the APIs**
   ```bash
   node scripts/test-trades-and-strategies.js
   ```

3. **Verify in the application**
   - Go to http://localhost:3000/dashboard/trades
   - Go to http://localhost:3000/dashboard/strategies
   - Try creating a new trade or strategy

