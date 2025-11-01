# Database Setup - How to Push Schema

## The Problem
You need to push the Prisma schema to your database, but `DATABASE_URL` is not set.

## Solutions

### Option 1: Use .env File (Recommended)

1. **Create .env file**
   ```bash
   cp env.template .env
   ```

2. **Edit .env and add your DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://postgres.username:password@db.projectid.supabase.co:6543/postgres?sslmode=require"
   ```

3. **Run the script**
   ```bash
   node scripts/push-db-with-env.js
   ```

---

### Option 2: Pass DATABASE_URL Directly (Quick)

**PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://..."; node scripts/push-direct.js
```

**Bash/Linux/Mac:**
```bash
DATABASE_URL="postgresql://..." node scripts/push-direct.js
```

---

### Option 3: Pass as Argument

```bash
node scripts/push-direct.js "postgresql://postgres:password@localhost:5432/dbname"
```

---

### Option 4: Use dotenv (Installs dotenv package)

```bash
npm install dotenv
```

Then run:
```bash
node scripts/push-db-with-env.js
```

---

## Finding Your DATABASE_URL

### If using Supabase:
1. Go to your Supabase project
2. Settings → Database
3. Connection string → Connection pooling
4. Copy the URI format
5. Replace password with your password

### If using local PostgreSQL:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_diary"
```

### If using Docker:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
```

---

## Complete Example

### With Supabase:
```powershell
# In PowerShell
$env:DATABASE_URL="postgresql://postgres.xxx:your_password@db.xxx.supabase.co:6543/postgres?sslmode=require"
node scripts/push-direct.js
```

```bash
# In Bash/Linux/Mac
DATABASE_URL="postgresql://postgres.xxx:your_password@db.xxx.supabase.co:6543/postgres?sslmode=require" node scripts/push-direct.js
```

### Create .env File (Better for repeated use):
```bash
# 1. Create .env file
echo 'DATABASE_URL="postgresql://postgres.xxx:password@db.xxx.supabase.co:6543/postgres?sslmode=require"' > .env

# 2. Run the script
node scripts/push-db-with-env.js
```

---

## Quick Commands

### For .env file approach:
```bash
node scripts/push-db-with-env.js
```

### For direct pass approach:
```bash
# PowerShell
$env:DATABASE_URL="postgresql://..."; node scripts/push-direct.js

# Bash
DATABASE_URL="postgresql://..." node scripts/push-direct.js
```

---

## Troubleshooting

### "Environment variable not found"
→ You need to either create a `.env` file or pass `DATABASE_URL` directly

### "Connection refused"
→ Check your database URL and make sure the database is accessible

### "SSL is required"
→ Make sure your connection string includes `?sslmode=require`

---

## After Success

Once the schema is pushed:
1. ✅ Restart your dev server: `npm run dev`
2. ✅ Test the APIs: `node scripts/test-trades-and-strategies.js`

