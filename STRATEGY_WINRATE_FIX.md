# Strategy Win Rate Shows 0% - How to Fix

## Problem
Win rates show 0% because there are no linked trades for these strategies. The strategies API matches trades to strategies by name.

## Current Strategies
- Strategy "232" (Category: Trend)
- Strategy "a" (Category: Breakout)

Both show: **0 trades**

## Solution: Link Trades to Strategies

### Option 1: Add New Trades with Strategy Names (Recommended)

When adding trades, set the strategy field to match your strategy name:

```javascript
// Example: Creating a trade for strategy "232"
{
  symbol: "NIFTY 50",
  direction: "Long",
  entryPrice: "19500",
  exitPrice: "19632",
  quantity: 50,
  strategy: "232",  // ← This must match the strategy name
  // ... other fields
}

// Example: Creating a trade for strategy "a" 
{
  symbol: "RELIANCE",
  direction: "Short",
  entryPrice: "2500",
  exitPrice: "2480",
  quantity: 100,
  strategy: "a",  // ← This must match the strategy name
  // ... other fields
}
```

### Option 2: Update Existing Trades

If you already have trades but they don't have the correct strategy field, you need to update them:

```javascript
// Update existing trades to link them to a strategy
const tradeId = "your-trade-id"
await fetch(`/api/trades/${tradeId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    strategy: "232"  // or "a" for the other strategy
  })
})
```

## How the Win Rate is Calculated

The API calculates win rate as follows:

```typescript
// 1. Finds all trades where: trade.strategy === strategy.name
const trades = await prisma.trade.findMany({
  where: {
    userId: strategy.userId,
    strategy: strategy.name  // ← Must match exactly
  }
})

// 2. Counts winning trades (pnl > 0)
const winningTrades = trades.filter(trade => trade.pnl > 0).length

// 3. Calculates percentage
const winRate = (winningTrades / totalTrades) * 100
```

## Current Status

The API is working correctly. The issue is that there are no trades with:
- `strategy` field matching "232" 
- `strategy` field matching "a"

## Next Steps

1. **Go to Trades page** (http://localhost:3000/dashboard/trades)
2. **Add a new trade** with `strategy: "232"` or `strategy: "a"`
3. **Refresh the Strategies page**
4. Win rate will update automatically!

## Verification

After adding trades, you should see:
- Strategy "232" showing the correct number of trades and win rate
- Strategy "a" showing the correct number of trades and win rate

