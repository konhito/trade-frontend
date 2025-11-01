-- Fix missing columns in Trade table
-- Run this SQL script against your database to add the missing columns

-- Add missing columns
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategyId" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "symbol" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "direction" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategy" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "duration" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Open';
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "pnlPercent" DOUBLE PRECISION;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "psychology" JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Trade_symbol_idx" ON "public"."Trade"("symbol");
CREATE INDEX IF NOT EXISTS "Trade_strategy_idx" ON "public"."Trade"("strategy");
CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "public"."Trade"("status");

-- Check the result
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Trade'
ORDER BY ordinal_position;

