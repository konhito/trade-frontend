# Scripts Index - Quick Reference

## 🚀 To Push Schema to Database

**REQUIRED: Stop dev server first (Ctrl+C)**

### Quick Method (Recommended)
```bash
node scripts/quick-push.js
```

### PowerShell Method (Windows)
```powershell
.\scripts\push-db.ps1
```

### Manual Method
```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

---

## 📊 Available Scripts

### Database Management
- `scripts/quick-push.js` - Fast schema push (use this!)
- `scripts/push-schema-to-db.js` - Interactive schema push with prompts
- `scripts/push-with-migration.js` - Create and apply migration (production)
- `scripts/check-database-tables.js` - List all tables in database
- `scripts/check-and-fix-database.js` - Check database structure and suggest fixes
- `scripts/fix-database-columns.sql` - SQL script to add missing columns

### Testing
- `scripts/test-trades-and-strategies.js` - Test API endpoints for trades and strategies

### Development
- `scripts/push-db.ps1` - PowerShell script for Windows

---

## 📝 Documentation Files

- `README_SCRIPTS.md` - Complete documentation for all scripts
- `PUSH_SCHEMA_NOW.md` - Step-by-step instructions to fix current issue
- `DATABASE_FIX_SUMMARY.md` - Summary of database schema fixes
- `FIX_INSTRUCTIONS.md` - Fix instructions for the strategyId issue

---

## 🎯 Current Issue & Solution

### Problem
`The column Trade.strategyId does not exist in the current database.`

### Status
✅ Schema has been updated (strategyId commented out)
⚠️ Prisma Client needs to be regenerated
⚠️ Dev server needs to be restarted

### Solution (Do This Now!)

1. **Stop dev server** → Press `Ctrl+C` in the terminal running `npm run dev`

2. **Push the schema** → Run one of:
   ```bash
   node scripts/quick-push.js
   # OR
   .\scripts\push-db.ps1
   # OR
   npx prisma generate && npx prisma db push --accept-data-loss
   ```

3. **Restart dev server** → Run `npm run dev`

4. **Test** → Run `node scripts/test-trades-and-strategies.js`

---

## ⚡ Quick Commands Reference

```bash
# Push schema to database
node scripts/quick-push.js

# Test APIs
node scripts/test-trades-and-strategies.js

# Check database
node scripts/check-and-fix-database.js

# Create migration
node scripts/push-with-migration.js
```

---

## 📚 Need More Info?

See `README_SCRIPTS.md` for detailed documentation of all scripts and workflows.

