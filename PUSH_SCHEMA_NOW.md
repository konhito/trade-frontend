# Push Schema to Database - Instructions

## ⚠️ IMPORTANT: Stop Your Dev Server First!

Your development server is currently running and has locked the Prisma client files. You need to stop it first.

## Steps to Push Schema

### Option 1: Manual Steps

1. **Stop the dev server**
   - Go to your terminal where `npm run dev` is running
   - Press `Ctrl+C` to stop it

2. **Run the push script**
   ```bash
   node scripts/quick-push.js
   ```

3. **Restart the dev server**
   ```bash
   npm run dev
   ```

4. **Test the APIs**
   ```bash
   node scripts/test-trades-and-strategies.js
   ```

### Option 2: Use PowerShell (Windows)

1. **Stop the dev server** (Ctrl+C)

2. **Run the PowerShell script**
   ```powershell
   .\scripts\push-db.ps1
   ```

3. **Restart the dev server**
   ```bash
   npm run dev
   ```

### Option 3: Direct Prisma Commands

1. **Stop the dev server** (Ctrl+C)

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Push to database**
   ```bash
   npx prisma db push --accept-data-loss
   ```

4. **Restart the dev server**
   ```bash
   npm run dev
   ```

## What These Commands Do

- **`npx prisma generate`**: Regenerates the Prisma Client with the updated schema (strategyId commented out)
- **`npx prisma db push --accept-data-loss`**: Pushes schema changes to database, creating missing columns

## After Running

Your schema is now synced with your database. You should be able to:
- ✅ Fetch trades without errors
- ✅ Create new trades
- ✅ Fetch strategies
- ✅ Create new strategies

## Troubleshooting

If you get "EPERM" errors, it means the dev server is still running. Make sure to:
1. Stop the dev server completely
2. Wait a few seconds
3. Run the scripts again

