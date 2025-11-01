-- MyTradeJournal: User Schema Improvement Migration
-- This migration improves the user-focused database structure for better scalability and maintainability

-- ========================================
-- 1. CREATE NEW TABLES
-- ========================================

-- User Profile table for extended user information
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL UNIQUE,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "experienceLevel" TEXT,
    "tradingStyle" TEXT,
    "primaryMarkets" TEXT[] DEFAULT '{}',
    "riskTolerance" TEXT,
    "occupation" TEXT,
    "company" TEXT,
    "yearsTrading" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "showStats" BOOLEAN NOT NULL DEFAULT true,
    "showTrades" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Account Groups for better organization
CREATE TABLE IF NOT EXISTS "AccountGroup" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "color" TEXT DEFAULT '#3B82F6',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ========================================
-- 2. ADD NEW COLUMNS TO EXISTING TABLES
-- ========================================

-- Enhance User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "displayName" TEXT,
ADD COLUMN IF NOT EXISTS "avatar" TEXT,
ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "theme" TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- Enhance TradingAccount table (rename from Account)
ALTER TABLE "Account" RENAME TO "TradingAccount";

-- Add new columns to TradingAccount
ALTER TABLE "TradingAccount"
ADD COLUMN IF NOT EXISTS "accountName" TEXT,
ADD COLUMN IF NOT EXISTS "broker" TEXT,
ADD COLUMN IF NOT EXISTS "accountType" TEXT DEFAULT 'LIVE',
ADD COLUMN IF NOT EXISTS "currentBalance" FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "isFunded" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "totalTrades" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalPnl" FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "winRate" FLOAT DEFAULT 0;

-- Enhance Trade table
ALTER TABLE "Trade"
ADD COLUMN IF NOT EXISTS "tradeId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "instrumentType" TEXT,
ADD COLUMN IF NOT EXISTS "direction" TEXT,
ADD COLUMN IF NOT EXISTS "fees" FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "netPnl" FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "analysis" JSONB DEFAULT '{}';

-- ========================================
-- 3. CREATE FOREIGN KEY CONSTRAINTS
-- ========================================

-- UserProfile foreign key
ALTER TABLE "UserProfile" 
ADD CONSTRAINT "UserProfile_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- AccountGroup foreign key
ALTER TABLE "AccountGroup" 
ADD CONSTRAINT "AccountGroup_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- ========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- User table indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_auth_user_id_idx" ON "User"("auth_user_id");
CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- UserProfile indexes
CREATE INDEX IF NOT EXISTS "UserProfile_userId_idx" ON "UserProfile"("userId");

-- AccountGroup indexes
CREATE INDEX IF NOT EXISTS "AccountGroup_userId_idx" ON "AccountGroup"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountGroup_name_userId_key" ON "AccountGroup"("name", "userId");

-- TradingAccount indexes
CREATE INDEX IF NOT EXISTS "TradingAccount_userId_idx" ON "TradingAccount"("userId");
CREATE INDEX IF NOT EXISTS "TradingAccount_accountNumber_idx" ON "TradingAccount"("accountNumber");
CREATE INDEX IF NOT EXISTS "TradingAccount_broker_idx" ON "TradingAccount"("broker");
CREATE INDEX IF NOT EXISTS "TradingAccount_accountType_idx" ON "TradingAccount"("accountType");
CREATE INDEX IF NOT EXISTS "TradingAccount_isActive_idx" ON "TradingAccount"("isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "TradingAccount_accountNumber_userId_key" ON "TradingAccount"("accountNumber", "userId");

-- Trade indexes
CREATE INDEX IF NOT EXISTS "Trade_userId_idx" ON "Trade"("userId");
CREATE INDEX IF NOT EXISTS "Trade_accountId_idx" ON "Trade"("accountId");
CREATE INDEX IF NOT EXISTS "Trade_symbol_idx" ON "Trade"("symbol");
CREATE INDEX IF NOT EXISTS "Trade_strategy_idx" ON "Trade"("strategy");
CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "Trade"("status");
CREATE INDEX IF NOT EXISTS "Trade_entryDate_idx" ON "Trade"("entryDate");
CREATE INDEX IF NOT EXISTS "Trade_closeDate_idx" ON "Trade"("closeDate");
CREATE INDEX IF NOT EXISTS "Trade_pnl_idx" ON "Trade"("pnl");
CREATE INDEX IF NOT EXISTS "Trade_tradeId_idx" ON "Trade"("tradeId");

-- ========================================
-- 5. MIGRATE EXISTING DATA
-- ========================================

-- Migrate existing Account data to TradingAccount
-- (This is handled by the rename above)

-- Create default AccountGroup for existing users
INSERT INTO "AccountGroup" ("id", "name", "description", "userId", "isDefault")
SELECT 
    gen_random_uuid(),
    'Default',
    'Default account group',
    "id",
    true
FROM "User"
WHERE NOT EXISTS (
    SELECT 1 FROM "AccountGroup" WHERE "userId" = "User"."id"
);

-- Update existing TradingAccounts to reference the default group
UPDATE "TradingAccount" 
SET "groupId" = (
    SELECT "id" FROM "AccountGroup" 
    WHERE "AccountGroup"."userId" = "TradingAccount"."userId" 
    AND "AccountGroup"."isDefault" = true
)
WHERE "groupId" IS NULL;

-- ========================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- User summary view
CREATE OR REPLACE VIEW "UserSummary" AS
SELECT 
    u."id",
    u."email",
    u."firstName",
    u."lastName",
    u."displayName",
    u."isActive",
    u."createdAt",
    up."experienceLevel",
    up."tradingStyle",
    up."primaryMarkets",
    COUNT(DISTINCT ta."id") as "accountCount",
    COUNT(DISTINCT t."id") as "tradeCount",
    COALESCE(SUM(t."pnl"), 0) as "totalPnl"
FROM "User" u
LEFT JOIN "UserProfile" up ON u."id" = up."userId"
LEFT JOIN "TradingAccount" ta ON u."id" = ta."userId"
LEFT JOIN "Trade" t ON u."id" = t."userId"
GROUP BY u."id", u."email", u."firstName", u."lastName", u."displayName", 
         u."isActive", u."createdAt", up."experienceLevel", up."tradingStyle", up."primaryMarkets";

-- Trading performance summary view
CREATE OR REPLACE VIEW "TradingPerformanceSummary" AS
SELECT 
    u."id" as "userId",
    u."email",
    COUNT(t."id") as "totalTrades",
    COUNT(CASE WHEN t."pnl" > 0 THEN 1 END) as "winningTrades",
    COUNT(CASE WHEN t."pnl" < 0 THEN 1 END) as "losingTrades",
    ROUND(
        CASE 
            WHEN COUNT(t."id") > 0 
            THEN (COUNT(CASE WHEN t."pnl" > 0 THEN 1 END)::FLOAT / COUNT(t."id")) * 100 
            ELSE 0 
        END, 2
    ) as "winRate",
    COALESCE(SUM(t."pnl"), 0) as "totalPnl",
    COALESCE(AVG(t."pnl"), 0) as "avgPnl",
    COALESCE(MAX(t."pnl"), 0) as "maxWin",
    COALESCE(MIN(t."pnl"), 0) as "maxLoss",
    COALESCE(SUM(t."commission"), 0) as "totalCommission"
FROM "User" u
LEFT JOIN "Trade" t ON u."id" = t."userId"
GROUP BY u."id", u."email";

-- ========================================
-- 7. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- ========================================

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_stats(user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalTrades', COUNT(t."id"),
        'winningTrades', COUNT(CASE WHEN t."pnl" > 0 THEN 1 END),
        'losingTrades', COUNT(CASE WHEN t."pnl" < 0 THEN 1 END),
        'winRate', CASE 
            WHEN COUNT(t."id") > 0 
            THEN ROUND((COUNT(CASE WHEN t."pnl" > 0 THEN 1 END)::FLOAT / COUNT(t."id")) * 100, 2)
            ELSE 0 
        END,
        'totalPnl', COALESCE(SUM(t."pnl"), 0),
        'avgPnl', COALESCE(AVG(t."pnl"), 0),
        'maxWin', COALESCE(MAX(t."pnl"), 0),
        'maxLoss', COALESCE(MIN(t."pnl"), 0),
        'totalCommission', COALESCE(SUM(t."commission"), 0)
    )
    INTO result
    FROM "Trade" t
    WHERE t."userId" = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. CREATE TRIGGERS FOR DATA CONSISTENCY
-- ========================================

-- Trigger to update user statistics when trades are modified
CREATE OR REPLACE FUNCTION update_user_trade_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update TradingAccount statistics
    UPDATE "TradingAccount" 
    SET 
        "totalTrades" = (
            SELECT COUNT(*) FROM "Trade" 
            WHERE "accountId" = COALESCE(NEW."accountId", OLD."accountId")
        ),
        "totalPnl" = (
            SELECT COALESCE(SUM("pnl"), 0) FROM "Trade" 
            WHERE "accountId" = COALESCE(NEW."accountId", OLD."accountId")
        ),
        "winRate" = (
            SELECT CASE 
                WHEN COUNT(*) > 0 
                THEN ROUND((COUNT(CASE WHEN "pnl" > 0 THEN 1 END)::FLOAT / COUNT(*)) * 100, 2)
                ELSE 0 
            END
            FROM "Trade" 
            WHERE "accountId" = COALESCE(NEW."accountId", OLD."accountId")
        )
    WHERE "id" = COALESCE(NEW."accountId", OLD."accountId");
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trade_stats_trigger ON "Trade";
CREATE TRIGGER trade_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Trade"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_trade_stats();

-- ========================================
-- 9. GRANT PERMISSIONS
-- ========================================

-- Grant necessary permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE "User" IS 'Core user accounts with authentication and basic information';
COMMENT ON TABLE "UserProfile" IS 'Extended user profile information and trading preferences';
COMMENT ON TABLE "TradingAccount" IS 'Trading accounts linked to users, including prop firm accounts';
COMMENT ON TABLE "AccountGroup" IS 'Groups for organizing trading accounts';
COMMENT ON TABLE "Trade" IS 'Individual trades with comprehensive tracking and analysis';
COMMENT ON TABLE "TradingPsychology" IS 'Psychology and emotional state tracking for trades';
COMMENT ON TABLE "TradingMistake" IS 'Trading mistakes and lessons learned';
COMMENT ON TABLE "TradingReport" IS 'Generated trading reports and analytics';
COMMENT ON TABLE "AISummary" IS 'AI-generated summaries and insights';
COMMENT ON TABLE "TradingChallenge" IS 'Trading challenges and goals';
COMMENT ON TABLE "TradingCalendar" IS 'Trading calendar events and reminders';
COMMENT ON TABLE "TradingTool" IS 'User-configured trading tools and utilities';
COMMENT ON TABLE "AffiliateLink" IS 'Affiliate links and resources';
COMMENT ON TABLE "Notification" IS 'User notifications and alerts';
COMMENT ON TABLE "Subscription" IS 'User subscription and billing information';
COMMENT ON TABLE "DashboardLayout" IS 'User dashboard layout configurations';
COMMENT ON TABLE "Mood" IS 'Daily mood and journaling data';
COMMENT ON TABLE "Tag" IS 'User-defined tags for categorization';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- This migration improves the database structure for:
-- 1. Better user data organization
-- 2. Enhanced trading account management
-- 3. Improved trade tracking and analysis
-- 4. Better performance with proper indexing
-- 5. Data consistency with triggers
-- 6. Common query optimization with views
-- 7. Scalable architecture for future growth
