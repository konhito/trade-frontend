-- Setup Long-term Data Storage
-- This script sets up the necessary schemas and tables for long-term data storage

-- Create schemas
CREATE SCHEMA IF NOT EXISTS archive;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create archive tables
CREATE TABLE IF NOT EXISTS archive.archived_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_trade_id UUID UNIQUE NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    entry_id VARCHAR(255) DEFAULT '',
    close_id VARCHAR(255) DEFAULT '',
    instrument VARCHAR(255) NOT NULL,
    entry_price VARCHAR(255) NOT NULL,
    close_price VARCHAR(255) NOT NULL,
    entry_date VARCHAR(255) NOT NULL,
    close_date VARCHAR(255) NOT NULL,
    pnl FLOAT NOT NULL,
    time_in_position FLOAT DEFAULT 0,
    user_id VARCHAR(255) NOT NULL,
    side VARCHAR(255) DEFAULT '',
    commission FLOAT DEFAULT 0,
    original_created_at TIMESTAMP NOT NULL,
    archived_at TIMESTAMP DEFAULT NOW(),
    comment TEXT,
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    image_base64 TEXT,
    image_base64_second TEXT,
    group_id VARCHAR(255) DEFAULT '',
    symbol VARCHAR(255),
    direction VARCHAR(255),
    strategy VARCHAR(255),
    duration VARCHAR(255),
    status VARCHAR(255),
    pnl_percent FLOAT,
    notes TEXT,
    psychology JSONB,
    archive_reason VARCHAR(255) DEFAULT 'AUTOMATIC',
    data_version INTEGER DEFAULT 1,
    compression_ratio FLOAT
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS analytics.daily_trading_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_pnl FLOAT DEFAULT 0,
    total_commission FLOAT DEFAULT 0,
    net_pnl FLOAT DEFAULT 0,
    win_rate FLOAT DEFAULT 0,
    profit_factor FLOAT DEFAULT 0,
    max_drawdown FLOAT DEFAULT 0,
    max_profit FLOAT DEFAULT 0,
    avg_time_in_position FLOAT DEFAULT 0,
    long_trades INTEGER DEFAULT 0,
    short_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    account_breakdown JSONB,
    strategy_breakdown JSONB,
    hourly_breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS analytics.weekly_trading_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_pnl FLOAT DEFAULT 0,
    total_commission FLOAT DEFAULT 0,
    net_pnl FLOAT DEFAULT 0,
    win_rate FLOAT DEFAULT 0,
    profit_factor FLOAT DEFAULT 0,
    max_drawdown FLOAT DEFAULT 0,
    max_profit FLOAT DEFAULT 0,
    avg_time_in_position FLOAT DEFAULT 0,
    long_trades INTEGER DEFAULT 0,
    short_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    daily_breakdown JSONB,
    account_breakdown JSONB,
    strategy_breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS analytics.monthly_trading_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_pnl FLOAT DEFAULT 0,
    total_commission FLOAT DEFAULT 0,
    net_pnl FLOAT DEFAULT 0,
    win_rate FLOAT DEFAULT 0,
    profit_factor FLOAT DEFAULT 0,
    max_drawdown FLOAT DEFAULT 0,
    max_profit FLOAT DEFAULT 0,
    avg_time_in_position FLOAT DEFAULT 0,
    long_trades INTEGER DEFAULT 0,
    short_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    weekly_breakdown JSONB,
    account_breakdown JSONB,
    strategy_breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

CREATE TABLE IF NOT EXISTS analytics.yearly_trading_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_pnl FLOAT DEFAULT 0,
    total_commission FLOAT DEFAULT 0,
    net_pnl FLOAT DEFAULT 0,
    win_rate FLOAT DEFAULT 0,
    profit_factor FLOAT DEFAULT 0,
    max_drawdown FLOAT DEFAULT 0,
    max_profit FLOAT DEFAULT 0,
    avg_time_in_position FLOAT DEFAULT 0,
    long_trades INTEGER DEFAULT 0,
    short_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    monthly_breakdown JSONB,
    account_breakdown JSONB,
    strategy_breakdown JSONB,
    sharpe_ratio FLOAT,
    sortino_ratio FLOAT,
    calmar_ratio FLOAT,
    max_consecutive_wins INTEGER DEFAULT 0,
    max_consecutive_losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, year)
);

-- Create data retention policy table
CREATE TABLE IF NOT EXISTS data_retention_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) UNIQUE NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create archive job table
CREATE TABLE IF NOT EXISTS archive_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_archived INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'RUNNING',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create compressed data table
CREATE TABLE IF NOT EXISTS archive.compressed_trading_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    date_range JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    compressed_data JSONB NOT NULL,
    compression_ratio FLOAT NOT NULL,
    original_size INTEGER NOT NULL,
    compressed_size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_archived_trades_user_id ON archive.archived_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_trades_account_number ON archive.archived_trades(account_number);
CREATE INDEX IF NOT EXISTS idx_archived_trades_entry_date ON archive.archived_trades(entry_date);
CREATE INDEX IF NOT EXISTS idx_archived_trades_archived_at ON archive.archived_trades(archived_at);
CREATE INDEX IF NOT EXISTS idx_archived_trades_archive_reason ON archive.archived_trades(archive_reason);

CREATE INDEX IF NOT EXISTS idx_daily_summary_user_id ON analytics.daily_trading_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON analytics.daily_trading_summary(date);
CREATE INDEX IF NOT EXISTS idx_daily_summary_total_pnl ON analytics.daily_trading_summary(total_pnl);
CREATE INDEX IF NOT EXISTS idx_daily_summary_win_rate ON analytics.daily_trading_summary(win_rate);

CREATE INDEX IF NOT EXISTS idx_weekly_summary_user_id ON analytics.weekly_trading_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summary_week_start ON analytics.weekly_trading_summary(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_summary_total_pnl ON analytics.weekly_trading_summary(total_pnl);
CREATE INDEX IF NOT EXISTS idx_weekly_summary_win_rate ON analytics.weekly_trading_summary(win_rate);

CREATE INDEX IF NOT EXISTS idx_monthly_summary_user_id ON analytics.monthly_trading_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_month_year ON analytics.monthly_trading_summary(month, year);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_total_pnl ON analytics.monthly_trading_summary(total_pnl);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_win_rate ON analytics.monthly_trading_summary(win_rate);

CREATE INDEX IF NOT EXISTS idx_yearly_summary_user_id ON analytics.yearly_trading_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_yearly_summary_year ON analytics.yearly_trading_summary(year);
CREATE INDEX IF NOT EXISTS idx_yearly_summary_total_pnl ON analytics.yearly_trading_summary(total_pnl);
CREATE INDEX IF NOT EXISTS idx_yearly_summary_win_rate ON analytics.yearly_trading_summary(win_rate);

CREATE INDEX IF NOT EXISTS idx_archive_job_table_name ON archive_job(table_name);
CREATE INDEX IF NOT EXISTS idx_archive_job_status ON archive_job(status);
CREATE INDEX IF NOT EXISTS idx_archive_job_start_time ON archive_job(start_time);

CREATE INDEX IF NOT EXISTS idx_compressed_data_user_id ON archive.compressed_trading_data(user_id);
CREATE INDEX IF NOT EXISTS idx_compressed_data_data_type ON archive.compressed_trading_data(data_type);
CREATE INDEX IF NOT EXISTS idx_compressed_data_date_range ON archive.compressed_trading_data USING GIN(date_range);

-- Add data retention fields to existing tables
ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS data_version INTEGER DEFAULT 1;

ALTER TABLE trade_analytics ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE trade_analytics ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

ALTER TABLE historical_data ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE historical_data ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Add data retention settings to users table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 365;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS archive_retention_days INTEGER DEFAULT 2555;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS auto_archive_enabled BOOLEAN DEFAULT true;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_trades_is_archived ON trades(is_archived);
CREATE INDEX IF NOT EXISTS idx_trades_archived_at ON trades(archived_at);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);

CREATE INDEX IF NOT EXISTS idx_trade_analytics_is_archived ON trade_analytics(is_archived);
CREATE INDEX IF NOT EXISTS idx_trade_analytics_archived_at ON trade_analytics(archived_at);

CREATE INDEX IF NOT EXISTS idx_historical_data_is_archived ON historical_data(is_archived);
CREATE INDEX IF NOT EXISTS idx_historical_data_archived_at ON historical_data(archived_at);

CREATE INDEX IF NOT EXISTS idx_user_data_retention_days ON "User"(data_retention_days);
CREATE INDEX IF NOT EXISTS idx_user_auto_archive_enabled ON "User"(auto_archive_enabled);

-- Insert default retention policies
INSERT INTO data_retention_policy (table_name, retention_days, archive_days, next_run_at) VALUES
('trades', 365, 2555, NOW() + INTERVAL '1 day'),
('tradeAnalytics', 365, 2555, NOW() + INTERVAL '1 day'),
('historicalData', 90, 630, NOW() + INTERVAL '1 day'),
('moods', 2555, 2555, NOW() + INTERVAL '1 day'),
('archivedTrades', 2555, 0, NOW() + INTERVAL '1 day'),
('notifications', 30, 0, NOW() + INTERVAL '1 day'),
('orders', 365, 2555, NOW() + INTERVAL '1 day'),
('payouts', 2555, 0, NOW() + INTERVAL '1 day')
ON CONFLICT (table_name) DO NOTHING;

-- Create a function to automatically create daily summaries
CREATE OR REPLACE FUNCTION create_daily_summary_for_user(p_user_id VARCHAR(255), p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_trade_count INTEGER;
    v_total_pnl FLOAT;
    v_total_commission FLOAT;
    v_net_pnl FLOAT;
    v_win_rate FLOAT;
    v_profit_factor FLOAT;
    v_max_drawdown FLOAT;
    v_max_profit FLOAT;
    v_avg_time_in_position FLOAT;
    v_long_trades INTEGER;
    v_short_trades INTEGER;
    v_winning_trades INTEGER;
    v_losing_trades INTEGER;
    v_account_breakdown JSONB;
    v_strategy_breakdown JSONB;
    v_hourly_breakdown JSONB;
BEGIN
    -- Get trade statistics for the day
    SELECT 
        COUNT(*),
        COALESCE(SUM(pnl), 0),
        COALESCE(SUM(commission), 0),
        COALESCE(SUM(pnl - COALESCE(commission, 0)), 0),
        CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE pnl > 0)::FLOAT / COUNT(*)) * 100 ELSE 0 END,
        CASE 
            WHEN SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END) > 0 
            THEN SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) / SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END)
            ELSE CASE WHEN SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) > 0 THEN 999 ELSE 0 END
        END,
        COALESCE(AVG(time_in_position), 0),
        COUNT(*) FILTER (WHERE direction = 'Long'),
        COUNT(*) FILTER (WHERE direction = 'Short'),
        COUNT(*) FILTER (WHERE pnl > 0),
        COUNT(*) FILTER (WHERE pnl < 0)
    INTO 
        v_trade_count, v_total_pnl, v_total_commission, v_net_pnl, v_win_rate, 
        v_profit_factor, v_avg_time_in_position, v_long_trades, v_short_trades, 
        v_winning_trades, v_losing_trades
    FROM trades 
    WHERE user_id = p_user_id 
        AND DATE(created_at) = p_date 
        AND is_archived = false;

    -- Only create summary if there are trades
    IF v_trade_count > 0 THEN
        -- Calculate account breakdown
        SELECT jsonb_object_agg(account_number, jsonb_build_object(
            'pnl', pnl_sum,
            'trades', trade_count,
            'commission', commission_sum
        ))
        INTO v_account_breakdown
        FROM (
            SELECT 
                account_number,
                SUM(pnl) as pnl_sum,
                COUNT(*) as trade_count,
                SUM(COALESCE(commission, 0)) as commission_sum
            FROM trades 
            WHERE user_id = p_user_id 
                AND DATE(created_at) = p_date 
                AND is_archived = false
            GROUP BY account_number
        ) t;

        -- Calculate strategy breakdown
        SELECT jsonb_object_agg(COALESCE(strategy, 'Unknown'), jsonb_build_object(
            'pnl', pnl_sum,
            'trades', trade_count,
            'commission', commission_sum
        ))
        INTO v_strategy_breakdown
        FROM (
            SELECT 
                COALESCE(strategy, 'Unknown') as strategy,
                SUM(pnl) as pnl_sum,
                COUNT(*) as trade_count,
                SUM(COALESCE(commission, 0)) as commission_sum
            FROM trades 
            WHERE user_id = p_user_id 
                AND DATE(created_at) = p_date 
                AND is_archived = false
            GROUP BY COALESCE(strategy, 'Unknown')
        ) t;

        -- Calculate hourly breakdown
        SELECT jsonb_object_agg(hour, jsonb_build_object(
            'pnl', pnl_sum,
            'trades', trade_count,
            'commission', commission_sum
        ))
        INTO v_hourly_breakdown
        FROM (
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour,
                SUM(pnl) as pnl_sum,
                COUNT(*) as trade_count,
                SUM(COALESCE(commission, 0)) as commission_sum
            FROM trades 
            WHERE user_id = p_user_id 
                AND DATE(created_at) = p_date 
                AND is_archived = false
            GROUP BY EXTRACT(HOUR FROM created_at)
        ) t;

        -- Insert or update daily summary
        INSERT INTO analytics.daily_trading_summary (
            user_id, date, total_trades, total_pnl, total_commission, net_pnl,
            win_rate, profit_factor, avg_time_in_position, long_trades, short_trades,
            winning_trades, losing_trades, account_breakdown, strategy_breakdown, hourly_breakdown
        ) VALUES (
            p_user_id, p_date, v_trade_count, v_total_pnl, v_total_commission, v_net_pnl,
            v_win_rate, v_profit_factor, v_avg_time_in_position, v_long_trades, v_short_trades,
            v_winning_trades, v_losing_trades, v_account_breakdown, v_strategy_breakdown, v_hourly_breakdown
        )
        ON CONFLICT (user_id, date) 
        DO UPDATE SET
            total_trades = EXCLUDED.total_trades,
            total_pnl = EXCLUDED.total_pnl,
            total_commission = EXCLUDED.total_commission,
            net_pnl = EXCLUDED.net_pnl,
            win_rate = EXCLUDED.win_rate,
            profit_factor = EXCLUDED.profit_factor,
            avg_time_in_position = EXCLUDED.avg_time_in_position,
            long_trades = EXCLUDED.long_trades,
            short_trades = EXCLUDED.short_trades,
            winning_trades = EXCLUDED.winning_trades,
            losing_trades = EXCLUDED.losing_trades,
            account_breakdown = EXCLUDED.account_breakdown,
            strategy_breakdown = EXCLUDED.strategy_breakdown,
            hourly_breakdown = EXCLUDED.hourly_breakdown,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to archive old trades
CREATE OR REPLACE FUNCTION archive_old_trades(p_user_id VARCHAR(255), p_cutoff_date TIMESTAMP)
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    -- Archive trades
    WITH archived AS (
        INSERT INTO archive.archived_trades (
            original_trade_id, account_number, quantity, entry_id, close_id, instrument,
            entry_price, close_price, entry_date, close_date, pnl, time_in_position,
            user_id, side, commission, original_created_at, comment, video_url, tags,
            image_base64, image_base64_second, group_id, symbol, direction, strategy,
            duration, status, pnl_percent, notes, psychology, archive_reason, data_version
        )
        SELECT 
            id, account_number, quantity, entry_id, close_id, instrument,
            entry_price, close_price, entry_date, close_date, pnl, time_in_position,
            user_id, side, commission, created_at, comment, video_url, tags,
            image_base64, image_base64_second, group_id, symbol, direction, strategy,
            duration, status, pnl_percent, notes, psychology, 'AUTOMATIC', data_version
        FROM trades 
        WHERE user_id = p_user_id 
            AND created_at < p_cutoff_date 
            AND is_archived = false
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_count FROM archived;

    -- Mark original trades as archived
    UPDATE trades 
    SET is_archived = true, archived_at = NOW()
    WHERE user_id = p_user_id 
        AND created_at < p_cutoff_date 
        AND is_archived = false;

    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON SCHEMA archive IS 'Archived trading data for long-term storage';
COMMENT ON SCHEMA analytics IS 'Aggregated trading analytics and summaries';
COMMENT ON FUNCTION create_daily_summary_for_user IS 'Creates daily trading summary for a user and date';
COMMENT ON FUNCTION archive_old_trades IS 'Archives old trades for a user before cutoff date';
