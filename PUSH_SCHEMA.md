# Push Schema to Database

## Quick Method

**Stop your dev server first!** (Press Ctrl+C in the terminal running `npm run dev`)

Then run:
```bash
node push-db-only.js
```

This will add the `historicalData` column to your Strategy table.

## What Gets Added

The schema will add this column to the Strategy table:
- `historicalData` - JSON field to store backtest vs live comparison data

## After Pushing

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3000/dashboard/strategies
3. Click the **Upload** button on any strategy
4. Paste your historical data in JSON format

## Example Data Format

```json
{
  "title": "Historical Backtest vs Live Data",
  "entries": [
    { "date": "2024-10-01", "day": "MON", "live": 5557, "backtest": 5571, "note": "-" },
    { "date": "2024-10-02", "day": "TUE", "live": 38059, "backtest": 51423, "note": "Previous 25 days" }
  ],
  "total": { "live": 43616, "backtest": 56994 }
}
```

## All Ready!

✅ Trades API - Working  
✅ Strategies API - Working  
✅ Import Historical Data Button - Added  
✅ Database Schema - Ready to push  

Just run `node push-db-only.js` when your dev server is stopped!

