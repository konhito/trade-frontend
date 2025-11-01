# Quick Start - Get Trades & Strategies Working

## ✅ What's Already Done
- ✅ Prisma schema updated (strategyId commented out)
- ✅ Prisma Client generated successfully
- ✅ API routes created and improved

## 🎯 What You Need to Do

### Step 1: Start Your Dev Server
```bash
npm run dev
```
Wait for "Ready" message

### Step 2: Test the APIs
In a **new terminal**:
```bash
node scripts/test-trades-and-strategies.js
```

## ✅ Expected Results

### Trades API Should:
- ✅ Fetch trades (returns empty array if no trades)
- ✅ Create new trades
- ✅ Support filtering by status, strategy, search

### Strategies API Should:
- ✅ Fetch strategies
- ✅ Create new strategies
- ✅ Calculate win rate and profit factor

## 🧪 Manual Testing

### Test Trades in Browser:
1. Go to http://localhost:3000/dashboard/trades
2. Click "Add Trade" button
3. Fill in the form and save
4. Trade should appear in the list

### Test Strategies in Browser:
1. Go to http://localhost:3000/dashboard/strategies
2. Click "Add Strategy" button
3. Fill in the form and save
4. Strategy should appear in the list

## 📊 API Endpoints

### Trades
- `GET /api/trades?userId=xxx` - Fetch all trades
- `POST /api/trades` - Create a trade
- `PUT /api/trades` - Update a trade
- `DELETE /api/trades?id=xxx` - Delete a trade

### Strategies
- `GET /api/strategies?userId=xxx` - Fetch all strategies
- `POST /api/strategies` - Create a strategy
- `PUT /api/strategies` - Update a strategy
- `DELETE /api/strategies?id=xxx` - Delete a strategy

## 🐛 Troubleshooting

### "Connection closed" error
- Your database connection timed out. This is normal with pooler
- Restart the dev server if it fails

### "StrategyId column does not exist"
- ✅ This is already fixed! The schema has been updated
- If you see this, restart the dev server

### API returns 500 error
- Check the terminal running `npm run dev` for error details
- Look for the error message in the logs

## 🎉 You're Done!
Once the dev server is running, trades and strategies should work perfectly!

