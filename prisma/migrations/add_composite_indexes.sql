-- Performance Optimization: Composite Indexes for Trade Table
-- These indexes significantly improve query performance for common filter patterns
-- Run this migration manually if you want to add these indexes

-- For queries filtering by userId + entryDate (most common pattern)
-- Used in: getTradesAction, dashboard filtering, calendar views
CREATE INDEX IF NOT EXISTS "Trade_userId_entryDate_idx" 
ON "Trade"("userId", "entryDate" DESC);

-- For queries filtering by userId + accountNumber
-- Used in: account-specific views, account balance calculations
CREATE INDEX IF NOT EXISTS "Trade_userId_accountNumber_idx" 
ON "Trade"("userId", "accountNumber");

-- For queries filtering by userId + strategy
-- Used in: strategy analytics, strategy filtering
CREATE INDEX IF NOT EXISTS "Trade_userId_strategy_idx" 
ON "Trade"("userId", "strategy") 
WHERE "strategy" IS NOT NULL;

-- For queries filtering by userId + status
-- Used in: filtering open/closed trades
CREATE INDEX IF NOT EXISTS "Trade_userId_status_idx" 
ON "Trade"("userId", "status") 
WHERE "status" IS NOT NULL;

-- Verify indexes were created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'Trade' 
    AND schemaname = 'public'
    AND indexname LIKE 'Trade_userId_%'
ORDER BY indexname;



