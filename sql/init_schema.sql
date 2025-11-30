CREATE DATABASE IF NOT EXISTS market_dwh;

CREATE TABLE IF NOT EXISTS market_dwh.fact_stock_daily (
    ticker String,
    trading_date Date,
    open Float64,
    high Float64,
    low Float64,
    close Float64,
    volume UInt64,
    -- ENRICHED COLUMNS (Calculated by you)
    ma_50 Float64 DEFAULT 0,
    ma_200 Float64 DEFAULT 0,
    rsi_14 Float64 DEFAULT 0,
    daily_return Float64 DEFAULT 0,
    source String DEFAULT 'vnstock',
    ingested_at DateTime DEFAULT now()
) 
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, trading_date);

CREATE TABLE IF NOT EXISTS market_dwh.fact_financial_ratios (
    ticker String,
    fiscal_date Date,
    year UInt16,
    quarter UInt8,
    pe_ratio Float64,
    pb_ratio Float64,
    roe Float64,
    net_profit_margin Float64,
    debt_to_equity Float64
)
ENGINE = ReplacingMergeTree()
ORDER BY (ticker, year, quarter);

CREATE TABLE IF NOT EXISTS market_dwh.dim_stock_companies (
    symbol String,
    organ_name String,
    exchange String,
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY symbol;

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

CREATE TABLE IF NOT EXISTS market_dwh.fact_income_statement (
    ticker String,
    fiscal_date Date,
    year UInt16,
    quarter UInt8,
    revenue Float64,
    cost_of_goods_sold Float64,
    gross_profit Float64,
    operating_profit Float64,
    net_profit_post_tax Float64,
    ingested_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, year, quarter);

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

CREATE VIEW IF NOT EXISTS market_dwh.view_market_daily_master AS
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
    f.rsi_14
FROM market_dwh.fact_stock_daily AS f
LEFT JOIN market_dwh.dim_stock_companies AS d 
    ON f.ticker = d.symbol;

CREATE VIEW IF NOT EXISTS market_dwh.view_valuation_daily AS
SELECT
    d.ticker,
    d.trading_date,
    d.close,
    -- Financials are pulled from the closest PAST quarter
    r.pe_ratio,
    r.pb_ratio,
    r.roe,
    r.fiscal_date AS last_report_date,
    -- Calculate Derived Metrics (Impressive!)
    -- If we assume Price / PE = EPS (approx), we can track Earnings Per Share daily
    CASE WHEN r.pe_ratio > 0 THEN d.close / r.pe_ratio ELSE 0 END AS implied_eps
FROM market_dwh.fact_stock_daily AS d
ASOF LEFT JOIN market_dwh.fact_financial_ratios AS r
    ON d.ticker = r.ticker
    AND d.trading_date >= r.fiscal_date;

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
        -- Calculate the "Previous 4 Quarters" value here
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
    -- Ratios (Joined from the other table)
    r.roe,
    r.net_profit_margin,
    r.debt_to_equity,
    -- Growth Calculation (Now safe and clean)
    -- We use NULLIF to prevent "Division by Zero" errors if last year was 0
    (m.revenue - m.revenue_last_year) / abs(NULLIF(m.revenue_last_year, 0)) * 100 AS revenue_growth_yoy,
    (m.net_profit_post_tax - m.profit_last_year) / abs(NULLIF(m.profit_last_year, 0)) * 100 AS profit_growth_yoy
FROM metrics_with_lag AS m
LEFT JOIN market_dwh.fact_financial_ratios AS r 
    ON m.ticker = r.ticker AND m.fiscal_date = r.fiscal_date
ORDER BY m.ticker, m.year, m.quarter;