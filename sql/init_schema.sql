-- ==========================================
-- 1. DATABASE SETUP
-- ==========================================
CREATE DATABASE IF NOT EXISTS market_dwh;

-- ==========================================
-- 2. FACT TABLES (The "Silver" Layer)
-- ==========================================

-- Table: Daily Stock Prices
-- Improvement: Using Decimal64(2) for prices to handle currency precision better than Float
CREATE TABLE IF NOT EXISTS market_dwh.fact_stock_daily (
    ticker String,
    trading_date Date,
    open Decimal64(2),
    high Decimal64(2),
    low Decimal64(2),
    close Decimal64(2),
    volume UInt64,
    -- Technical Indicators (Statistical approximations, so Float is acceptable here)
    ma_50 Float64 DEFAULT 0,
    ma_200 Float64 DEFAULT 0,
    rsi_14 Float64 DEFAULT 0,
    daily_return Float64 DEFAULT 0,
    source String DEFAULT 'vnstock',
    ingested_at DateTime DEFAULT now()
) 
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, trading_date);

-- Table: Quarterly Financial Ratios
-- Updated Schema with new metrics
DROP TABLE IF EXISTS market_dwh.fact_financial_ratios;
CREATE TABLE IF NOT EXISTS market_dwh.fact_financial_ratios (
    ticker String,
    fiscal_date Date,
    year UInt16,
    quarter UInt8,
    
    -- VALUATION
    pe_ratio Float64,
    pb_ratio Float64,
    ps_ratio Float64,           -- NEW (Price/Sales)
    p_cashflow_ratio Float64,   -- NEW (Price/Cash Flow)
    eps Float64,                -- NEW (Earnings Per Share)
    bvps Float64,               -- NEW (Book Value Per Share)
    market_cap Float64,         -- NEW (In Billion VND)
    
    -- EFFICIENCY & PROFITABILITY
    roe Float64,
    roa Float64,
    roic Float64,               -- NEW (Key for Researchers!)
    net_profit_margin Float64,
    
    -- HEALTH & LEVERAGE
    debt_to_equity Float64,
    financial_leverage Float64, -- NEW
    dividend_yield Float64,     -- NEW
    
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree()
ORDER BY (ticker, year, quarter);

-- Table: Company Metadata
CREATE TABLE IF NOT EXISTS market_dwh.dim_stock_companies (
    symbol String,
    organ_name String,
    exchange String,
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY symbol;

-- Table: Dividend History
CREATE TABLE IF NOT EXISTS market_dwh.fact_dividends (
    ticker String,
    exercise_date Date,
    cash_year UInt16,
    cash_dividend_percentage Float64,
    stock_dividend_percentage Float64,
    issue_method String,
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, exercise_date);

-- Table: Income Statement
-- Improvement: Using Decimal128(2) for Revenue/Profit. 
-- Vietnamese companies can report revenue in Trillions (10^12+), which risks overflow in smaller types.
CREATE TABLE IF NOT EXISTS market_dwh.fact_income_statement (
    ticker String,
    fiscal_date Date,
    year UInt16,
    quarter UInt8,
    revenue Decimal128(2),
    cost_of_goods_sold Decimal128(2),
    gross_profit Decimal128(2),
    operating_profit Decimal128(2),
    net_profit_post_tax Decimal128(2),
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, year, quarter);

-- Table: News Sentiment (Optional)
CREATE TABLE IF NOT EXISTS market_dwh.fact_news (
    ticker String,
    publish_date DateTime,
    title String,
    source String,
    price_at_publish Float64,
    price_change Float64,
    price_change_ratio Float64,
    rsi Float64,
    rs Float64,
    news_id UInt64,
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, publish_date, news_id);

-- ==========================================
-- 3. ANALYTICAL VIEWS (The "Gold" Layer)
-- ==========================================

-- View 1: Master Daily Data (Joins Prices with Company Names)
CREATE OR REPLACE VIEW market_dwh.view_market_daily_master AS
SELECT
    f.ticker,
    d.organ_name AS company_name,
    d.exchange,
    f.trading_date,
    f.close,
    f.volume,
    f.daily_return,
    f.ma_50,
    f.ma_200,
    f.rsi_14,
    r.market_cap AS market_cap_bn_vnd,
    r.roic
FROM market_dwh.fact_stock_daily AS f
LEFT JOIN market_dwh.dim_stock_companies AS d 
    ON f.ticker = d.symbol
ASOF LEFT JOIN market_dwh.fact_financial_ratios AS r
    ON f.ticker = r.ticker
    AND f.trading_date >= r.fiscal_date;

-- View 2: Daily Valuation Tracker
-- Logic: Uses ASOF JOIN to map Daily Prices to the most recent Quarterly Report
CREATE OR REPLACE VIEW market_dwh.view_valuation_daily AS
SELECT
    d.ticker,
    d.trading_date,
    d.close,
    -- Financials from the closest PAST quarter
    r.pe_ratio,
    r.pb_ratio,
    r.roe,
    r.fiscal_date AS last_report_date,
    -- Implied EPS Calculation: Price / PE = EPS
    -- Explicitly Cast to Float64 to avoid type mismatch between Decimal and Float
    CASE 
        WHEN r.pe_ratio > 0 THEN toFloat64(d.close) / r.pe_ratio 
        ELSE 0 
    END AS implied_eps
FROM market_dwh.fact_stock_daily AS d
ASOF LEFT JOIN market_dwh.fact_financial_ratios AS r
    ON d.ticker = r.ticker
    AND d.trading_date >= r.fiscal_date;

-- View 3: Fundamental Health Scanner
-- Logic: Uses CTE + LAG Window Function for safe Year-Over-Year Growth calculation
CREATE OR REPLACE VIEW market_dwh.view_fundamental_health AS
WITH metrics_with_lag AS (
    SELECT 
        ticker,
        year,
        quarter,
        fiscal_date,
        revenue,
        net_profit_post_tax,
        gross_profit,
        -- Look back 4 rows (1 year)
        lag(revenue, 4) OVER (PARTITION BY ticker ORDER BY fiscal_date) as revenue_last_year,
        lag(net_profit_post_tax, 4) OVER (PARTITION BY ticker ORDER BY fiscal_date) as profit_last_year
    FROM market_dwh.fact_income_statement
)
SELECT
    m.ticker,
    m.year,
    m.quarter,
    m.fiscal_date,
    -- Raw Metrics
    m.revenue,
    m.net_profit_post_tax,
    m.gross_profit,
    -- Ratios
    r.roe,
    r.net_profit_margin,
    r.debt_to_equity,
    toFloat64(m.revenue - m.revenue_last_year) / abs(toFloat64(NULLIF(m.revenue_last_year, 0))) * 100 AS revenue_growth_yoy,
    toFloat64(m.net_profit_post_tax - m.profit_last_year) / abs(toFloat64(NULLIF(m.profit_last_year, 0))) * 100 AS profit_growth_yoy
FROM metrics_with_lag AS m
LEFT JOIN market_dwh.fact_financial_ratios AS r 
    ON m.ticker = r.ticker AND m.fiscal_date = r.fiscal_date
ORDER BY m.ticker, m.year, m.quarter;