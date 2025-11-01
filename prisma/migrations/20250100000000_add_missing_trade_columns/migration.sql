-- Add missing columns to Trade table that exist in schema but not in database
-- These columns are defined in schema.prisma but were never migrated

-- Add strategyId column for linking trades to strategies
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategyId" TEXT;

-- Add symbol column (e.g., "NIFTY 50", "RELIANCE")
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "symbol" TEXT;

-- Add direction column ("Long" or "Short")
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "direction" TEXT;

-- Add strategy column (Trading strategy used)
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategy" TEXT;

-- Add duration column ("Intraday" or "Swing")
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "duration" TEXT;

-- Add status column ("Open" or "Closed")
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Open';

-- Add pnlPercent column (P&L percentage)
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "pnlPercent" DOUBLE PRECISION;

-- Add notes column (Trade notes)
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add psychology column (Psychology data as JSON)
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "psychology" JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Trade_symbol_idx" ON "public"."Trade"("symbol");
CREATE INDEX IF NOT EXISTS "Trade_strategy_idx" ON "public"."Trade"("strategy");
CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "public"."Trade"("status");

