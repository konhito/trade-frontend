# AI Summarizer - Token Limits & Data Input Summary

## ✅ Token Limits Increased

### Output Tokens
- **Previous**: 2,048 tokens
- **New**: **8,192 tokens** (4x increase)
- **Result**: Full comprehensive responses without truncation

### Input Token Limits
- **Max Input**: ~32,000 tokens (Gemini 2.5 Flash limit)
- **Warning Threshold**: 25,000 tokens (increased from 6,000)
- **Daily Summary Max Trades**: 100 (increased from 50)
- **Other Summaries Max Trades**: 50 (increased from 30)

---

## Data Input for All 4 Summary Types

### 📊 Summary Table

| Type | Trades | Strategies | Date Filter | Max Trades | Strategy Metrics |
|------|--------|------------|-------------|------------|------------------|
| **Daily** | ✅ Today only | ✅ Today only* | ✅ Yes | 100 | From today's trades |
| **Strategy** | ✅ Recent (context) | ✅ All (primary) | ❌ No | 50 | From historical data |
| **Market** | ✅ Recent | ❌ None | ❌ No | 50 | N/A |
| **Risk** | ✅ Recent | ✅ All | ❌ No | 50 | From historical data |

*Strategies only included if used in today's trades

---

## 1. Daily Summary (`daily`)

### Input Data:
- **Trades**: Today's trades only (filtered by entryDate)
  - Max: 100 trades
  - Format: `[{s, d, p, pp, ed, ep, cp, q, st}, ...]`
  
- **Strategies**: Only strategies used in today's trades (if any)
  - Metrics calculated from today's trades only
  - Format: `[{id, n, d, c, a, pnl, tr, wr, pf}, ...]`

### Example:
```json
Trades: [
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum"}
]
Strategies: [
  {"id":"1","n":"Momentum","d":"...","c":"Swing","a":true,"pnl":100,"tr":1,"wr":100,"pf":999}
]
```

### Token Estimate: 4,000-6,000 input tokens

---

## 2. Strategy Review (`strategy`)

### Input Data:
- **Strategies**: All strategies (up to 10) with historical performance
  - Primary focus
  - Metrics from historical data
  - Format: `[{id, n, d, c, a, pnl, tr, wr, pf}, ...]`
  
- **Trades**: Recent 50 trades (for context)
  - Secondary/contextual
  - Format: `[{s, d, p, pp, ed, ep, cp, q, st}, ...]`

### Example:
```json
Strategies: [
  {"id":"1","n":"Momentum","d":"...","c":"Swing","a":true,"pnl":1250.50,"tr":25,"wr":68.5,"pf":2.3},
  {"id":"2","n":"Reversal","d":"...","c":"Day","a":true,"pnl":-200.30,"tr":15,"wr":40.0,"pf":0.8}
]
Trades: [
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum"},
  // ... up to 50 recent trades
]
```

### Token Estimate: 3,000-4,500 input tokens

---

## 3. Market Analysis (`market`)

### Input Data:
- **Trades**: Recent 50 trades only
  - No strategies included
  - Format: `[{s, d, p, pp, ed, ep, cp, q, st}, ...]`
  
- **Strategies**: ❌ None

### Example:
```json
Trades: [
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum"},
  {"s":"MSFT","d":"SHORT","p":-50,"pp":-1.2,"ed":"2024-01-15T11:00:00Z","ep":300,"cp":301.2,"q":5,"st":"Reversal"},
  // ... up to 50 recent trades
]
```

### Token Estimate: 2,000-2,500 input tokens

---

## 4. Risk Analysis (`risk`)

### Input Data:
- **Trades**: Recent 50 trades
  - Format: `[{s, d, p, pp, ed, ep, cp, q, st}, ...]`
  
- **Strategies**: All strategies (up to 10) with historical performance
  - Format: `[{id, n, d, c, a, pnl, tr, wr, pf}, ...]`

### Example:
```json
Trades: [
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum"},
  // ... up to 50 recent trades
]
Strategies: [
  {"id":"1","n":"Momentum","d":"...","c":"Swing","a":true,"pnl":1250.50,"tr":25,"wr":68.5,"pf":2.3},
  // ... up to 10 strategies
]
```

### Token Estimate: 3,500-5,000 input tokens

---

## Data Field Meanings

### Trade Fields (Compact Format):
- `s` = symbol (instrument name)
- `d` = direction (LONG/SHORT)
- `p` = pnl (profit/loss amount)
- `pp` = pnlPercent (profit/loss percentage)
- `ed` = entryDate (ISO timestamp)
- `ep` = entryPrice
- `cp` = closePrice (exit price)
- `q` = quantity
- `st` = strategy (strategy name or null)

### Strategy Fields (Compact Format):
- `id` = strategy ID
- `n` = name
- `d` = description
- `c` = category
- `a` = isActive (boolean)
- `pnl` = total P&L
- `tr` = total trades
- `wr` = win rate (percentage)
- `pf` = profit factor

---

## Key Differences

1. **Daily Summary**: Only today's data, strategies filtered to today's usage
2. **Strategy Review**: Historical strategy data, trades for context
3. **Market Analysis**: Trades only, no strategies
4. **Risk Analysis**: Both trades and strategies, comprehensive risk assessment

---

## Token Usage Summary

| Type | Input Tokens | Output Tokens | Total Capacity |
|------|--------------|---------------|----------------|
| Daily | 4,000-6,000 | 8,192 | ~14,000 tokens |
| Strategy | 3,000-4,500 | 8,192 | ~12,500 tokens |
| Market | 2,000-2,500 | 8,192 | ~10,500 tokens |
| Risk | 3,500-5,000 | 8,192 | ~13,000 tokens |

**All well within Gemini 2.5 Flash's ~32,000 token input limit!**








