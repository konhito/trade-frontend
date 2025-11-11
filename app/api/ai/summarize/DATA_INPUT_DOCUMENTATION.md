# AI Summarizer - Data Input Documentation for All 4 Summary Types

## Overview

This document details exactly what data is sent as input to the AI for each of the 4 summary types.

---

## Token Configuration

- **Max Output Tokens**: 8,192 (increased from 2,048 for comprehensive responses)
- **Max Input Tokens**: ~32,000 (Gemini 2.5 Flash limit)
- **Daily Summary Max Trades**: 100 (increased from 50)
- **Other Summaries Max Trades**: 50 (increased from 30)
- **Warning Threshold**: 25,000 input tokens (increased from 6,000)

---

## Data Structure

### Trade Data Format (Compact JSON)

Each trade is represented with shortened keys to minimize token usage:

```json
{
  "s": "AAPL",           // symbol (instrument)
  "d": "LONG",           // direction (side: LONG/SHORT)
  "p": 150.50,           // pnl (profit/loss)
  "pp": 2.5,             // pnlPercent (profit/loss percentage)
  "ed": "2024-01-15T10:00:00Z",  // entryDate (ISO timestamp)
  "ep": 150.00,          // entryPrice
  "cp": 152.50,          // closePrice (exitPrice)
  "q": 10,               // quantity
  "st": "Strategy Name"  // strategy (strategy name or null)
}
```

### Strategy Data Format (Compact JSON)

Each strategy includes performance metrics:

```json
{
  "id": "strategy-id-123",
  "n": "Momentum Breakout",  // name
  "d": "Strategy description", // description
  "c": "Swing Trading",       // category
  "a": true,                   // isActive
  "pnl": 1250.50,             // total P&L
  "tr": 25,                    // total trades
  "wr": 68.5,                  // win rate (percentage)
  "pf": 2.3                    // profit factor
}
```

---

## Summary Type 1: Daily Summary (`daily`)

### Input Data Sources

1. **Trades Data**
   - **Source**: Backend API `/trades?userId={id}&from={todayISO}`
   - **Filter**: Only trades from today (entryDate matches today's date)
   - **Date Filtering**: 
     - API query uses `from` parameter set to today at midnight
     - Additional client-side filter by entryDate to ensure accuracy
   - **Max Trades**: 100 (all today's trades, capped at 100)
   - **Sorting**: Most recent first (by entryDate)
   - **Format**: Compact JSON array of trade objects

2. **Strategies Data** (Conditional - only if strategies were used today)
   - **Source**: Backend API `/strategies?userId={id}`
   - **Filter**: Only strategies that appear in today's trades
   - **Performance Metrics**: Calculated from **today's trades only**
     - P&L: Sum of P&L from today's trades for this strategy
     - Total Trades: Count of today's trades using this strategy
     - Win Rate: Percentage of winning trades today
     - Profit Factor: Calculated from today's profits vs losses
   - **Max Strategies**: All strategies used today (no limit, but typically 1-5)

### Example Input Data

**Trades Data:**
```json
[
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum Breakout"},
  {"s":"MSFT","d":"SHORT","p":-50,"pp":-1.2,"ed":"2024-01-15T11:00:00Z","ep":300,"cp":301.2,"q":5,"st":"Reversal Strategy"}
]
```

**Strategies Data (if available):**
```json
[
  {"id":"1","n":"Momentum Breakout","d":"Breakout strategy","c":"Swing","a":true,"pnl":100,"tr":1,"wr":100,"pf":999},
  {"id":"2","n":"Reversal Strategy","d":"Reversal setup","c":"Day","a":true,"pnl":-50,"tr":1,"wr":0,"pf":0}
]
```

### Prompt Structure

```
Analyze these trades from today and provide a concise daily summary. 

Trades Data (from today only): [tradesData]
Strategies Data (used today only, with today's performance metrics): [strategiesData] (if available)

Provide: Performance overview (win rate, P&L), key patterns, strategy performance analysis for strategies used today (if available), improvement recommendations, and risk assessment. Use markdown with headings (##), bullets, and bold text. Keep it focused and actionable.
```

### Key Characteristics

- ✅ **Today-only filtering**: Double-checked (API + client-side)
- ✅ **Today-only strategy metrics**: All calculations from today's trades
- ✅ **Conditional strategies**: Only included if strategies were used today
- ✅ **Comprehensive analysis**: Performance, patterns, strategies, recommendations, risk

---

## Summary Type 2: Strategy Review (`strategy`)

### Input Data Sources

1. **Strategies Data** (Primary)
   - **Source**: Backend API `/strategies?userId={id}`
   - **Filter**: All strategies (up to 10)
   - **Performance Metrics**: Calculated from **historical data** (historicalData.entries)
     - P&L: Sum of all historical P&L values
     - Total Trades: Count of all historical entries
     - Win Rate: Percentage of winning historical trades
     - Profit Factor: Calculated from all historical profits vs losses
   - **Max Strategies**: 10 (most active/recent)

2. **Trades Data** (Context/Secondary)
   - **Source**: Backend API `/trades?userId={id}` (no date filter)
   - **Filter**: Recent trades (most recent 50)
   - **Sorting**: Most recent first (by entryDate)
   - **Purpose**: Provides context for strategy analysis
   - **Max Trades**: 50

### Example Input Data

**Strategies Data:**
```json
[
  {"id":"1","n":"Momentum Breakout","d":"Breakout strategy","c":"Swing","a":true,"pnl":1250.50,"tr":25,"wr":68.5,"pf":2.3},
  {"id":"2","n":"Reversal Strategy","d":"Reversal setup","c":"Day","a":true,"pnl":-200.30,"tr":15,"wr":40.0,"pf":0.8},
  {"id":"3","n":"Trend Following","d":"Follow the trend","c":"Swing","a":true,"pnl":3500.75,"tr":42,"wr":71.4,"pf":3.1}
]
```

**Trades Data (for context):**
```json
[
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum Breakout"},
  // ... up to 50 recent trades
]
```

### Prompt Structure

```
Analyze and compare trading strategies with their performance data. Focus primarily on STRATEGIES analysis.

Strategies Data (with performance metrics): [strategiesData]
Trades Data (for context): [tradesData]

For EACH strategy, analyze:
1. Performance metrics (P&L, win rate, profit factor, total trades)
2. Strategy effectiveness and consistency
3. Strengths and weaknesses
4. Comparison between different strategies
5. Optimization recommendations specific to each strategy
6. Risk assessment per strategy

Provide: Detailed strategy-by-strategy analysis, performance comparison table, strategy ranking, optimization recommendations, and actionable insights. Use markdown with headings (##), bullets, bold text, and tables. Focus on STRATEGY analysis, not just trades.
```

### Key Characteristics

- ✅ **Historical data**: Uses full strategy performance history
- ✅ **Strategy-focused**: Primary focus on strategies, trades for context
- ✅ **Comprehensive comparison**: All strategies analyzed and compared
- ✅ **Can work without trades**: Only needs strategies (trades optional)

---

## Summary Type 3: Market Analysis (`market`)

### Input Data Sources

1. **Trades Data** (Primary and Only)
   - **Source**: Backend API `/trades?userId={id}` (no date filter)
   - **Filter**: Recent trades (most recent 50)
   - **Sorting**: Most recent first (by entryDate)
   - **Purpose**: Analyze market conditions from trading patterns
   - **Max Trades**: 50

2. **Strategies Data**: **NOT INCLUDED**

### Example Input Data

**Trades Data:**
```json
[
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum Breakout"},
  {"s":"MSFT","d":"SHORT","p":-50,"pp":-1.2,"ed":"2024-01-15T11:00:00Z","ep":300,"cp":301.2,"q":5,"st":"Reversal Strategy"},
  {"s":"GOOGL","d":"LONG","p":200,"pp":3.1,"ed":"2024-01-14T14:00:00Z","ep":140,"cp":144.3,"q":15,"st":null},
  // ... up to 50 recent trades
]
```

### Prompt Structure

```
Analyze market conditions from trading data: [tradesData]

Provide: Market conditions inference, asset performance trends, technical insights, market sentiment, trading opportunities, and outlook. Use markdown with headings (##), bullets, bold text, and tables. Keep it concise.
```

### Key Characteristics

- ✅ **Trades only**: No strategies data included
- ✅ **Recent trades**: Uses most recent 50 trades (not filtered to today)
- ✅ **Market-focused**: Analyzes market conditions, sentiment, opportunities
- ✅ **Concise**: Prompt asks for concise analysis

---

## Summary Type 4: Risk Analysis (`risk`)

### Input Data Sources

1. **Trades Data** (Primary)
   - **Source**: Backend API `/trades?userId={id}` (no date filter)
   - **Filter**: Recent trades (most recent 50)
   - **Sorting**: Most recent first (by entryDate)
   - **Purpose**: Analyze risk from trading patterns
   - **Max Trades**: 50

2. **Strategies Data** (Secondary)
   - **Source**: Backend API `/strategies?userId={id}`
   - **Filter**: All strategies (up to 10)
   - **Performance Metrics**: Calculated from **historical data**
   - **Max Strategies**: 10
   - **Purpose**: Assess risk per strategy and overall portfolio risk

### Example Input Data

**Trades Data:**
```json
[
  {"s":"AAPL","d":"LONG","p":100,"pp":2.5,"ed":"2024-01-15T10:00:00Z","ep":150,"cp":152.5,"q":10,"st":"Momentum Breakout"},
  // ... up to 50 recent trades
]
```

**Strategies Data:**
```json
[
  {"id":"1","n":"Momentum Breakout","d":"Breakout strategy","c":"Swing","a":true,"pnl":1250.50,"tr":25,"wr":68.5,"pf":2.3},
  // ... up to 10 strategies
]
```

### Prompt Structure

```
Analyze risk from trading data. Trades: [tradesData]. Strategies: [strategiesData]

Provide: Risk metrics (drawdown, Sharpe, volatility), risk factors, position sizing recommendations, diversification assessment, risk mitigation actions, and stop-loss/take-profit advice. Use markdown with headings (##), bullets, bold text, and tables. Keep it focused.
```

### Key Characteristics

- ✅ **Both data types**: Uses both trades and strategies
- ✅ **Risk-focused**: Analyzes risk metrics, factors, mitigation
- ✅ **Comprehensive**: Drawdown, Sharpe ratio, volatility, position sizing
- ✅ **Actionable**: Provides specific recommendations

---

## Data Flow Summary

| Summary Type | Trades Data | Strategies Data | Date Filter | Max Trades | Strategy Metrics Source |
|-------------|-------------|-----------------|-------------|------------|------------------------|
| **Daily** | ✅ Today only | ✅ Today only (conditional) | ✅ Yes | 100 | Today's trades |
| **Strategy** | ✅ Recent (context) | ✅ All (primary) | ❌ No | 50 | Historical data |
| **Market** | ✅ Recent | ❌ None | ❌ No | 50 | N/A |
| **Risk** | ✅ Recent | ✅ All (secondary) | ❌ No | 50 | Historical data |

---

## Token Usage Estimates

### Per Trade Object
- **Size**: ~150-200 characters
- **Tokens**: ~40-50 tokens per trade
- **100 trades**: ~4,000-5,000 tokens

### Per Strategy Object
- **Size**: ~200-300 characters
- **Tokens**: ~50-75 tokens per strategy
- **10 strategies**: ~500-750 tokens

### Prompt Base
- **Daily**: ~300 tokens
- **Strategy**: ~400 tokens
- **Market**: ~200 tokens
- **Risk**: ~350 tokens

### Total Estimates
- **Daily Summary**: 4,000-6,000 tokens (input) + 8,192 tokens (output)
- **Strategy Review**: 3,000-4,500 tokens (input) + 8,192 tokens (output)
- **Market Analysis**: 2,000-2,500 tokens (input) + 8,192 tokens (output)
- **Risk Analysis**: 3,500-5,000 tokens (input) + 8,192 tokens (output)

---

## Notes

1. **Daily Summary** is the only type that filters by date (today only)
2. **Daily Summary** is the only type that calculates strategy metrics from specific trades (today's trades)
3. **Strategy Review** can work with strategies only (trades optional)
4. **Market Analysis** uses trades only (no strategies)
5. All data uses compact JSON format to minimize token usage
6. Token limits have been increased to support comprehensive full responses

