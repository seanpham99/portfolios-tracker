# Data Pipeline Architecture

**Part:** services/data-pipeline  
**Type:** Apache Airflow ETL Pipeline  
**Generated:** December 26, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [DAG Workflows](#dag-workflows)
5. [Data Models](#data-models)
6. [ETL Modules](#etl-modules)
7. [Infrastructure](#infrastructure)
8. [Testing Strategy](#testing-strategy)
9. [Operations & Monitoring](#operations--monitoring)
10. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

The Data Pipeline is a production-ready ETL (Extract, Transform, Load) system built on Apache Airflow that automates the ingestion and processing of Vietnamese stock market data. The pipeline fetches daily price data, calculates technical indicators, retrieves financial ratios, and delivers AI-powered market insights via Telegram.

**Key Characteristics:**

- **Orchestration:** Apache Airflow 3.1.3 with CeleryExecutor
- **Data Warehouse:** ClickHouse (columnar OLAP database)
- **Metadata DB:** PostgreSQL 16
- **Message Broker:** Redis 7.2
- **Language:** Python 3.12
- **Scheduler:** Cron-based (6 PM daily for EOD, 7 AM for news)
- **Deployment:** Docker Compose (7 containers)

**Current Status:** Production-ready with 87% test coverage. Processes 6 Vietnamese stocks (HPG, VCB, VNM, FPT, MWG, VIC) daily.

---

## 2. Technology Stack

### Core Orchestration

```txt
apache-airflow==3.1.3
apache-airflow-providers-postgres
apache-airflow-providers-telegram
apache-airflow-providers-common-sql
```

**Airflow Configuration:**

- **Executor:** CeleryExecutor (distributed task execution)
- **Backend:** Redis as Celery broker
- **Metadata:** PostgreSQL for task state
- **Scheduler:** Built-in cron scheduler

### Data Storage

```txt
# Database Drivers
psycopg2-binary==2.9.9          # PostgreSQL
clickhouse-connect==0.7.0        # ClickHouse (official Python driver)
asyncpg==0.29.0                  # Async PostgreSQL
```

**Storage Strategy:**

- **ClickHouse** - OLAP database for time-series market data (prices, indicators)
- **PostgreSQL** - Airflow metadata (DAG runs, task instances, logs)

### Data Sources & Processing

```txt
# Data Fetching
yfinance==0.2.36                 # US/Global stocks (future)
vnstock==1.0.8                   # Vietnamese stock data
pandas==2.1.4                    # DataFrame operations
numpy==1.26.3                    # Numerical computing

# Technical Analysis
pandas_ta==0.4.71b0              # Technical indicators (RSI, MACD, MA)

# API Integration
requests==2.31.0                 # HTTP requests
websockets==12.0                 # WebSocket connections (future)
```

### AI & Notifications

```txt
# Notifications
python-telegram-bot (via Airflow provider)

# AI
google-generativeai (Gemini API for news summarization)

# Configuration
python-dotenv==1.0.0             # Environment variables
```

### Testing & Quality

```txt
pytest==7.4.0
pytest-mock==3.11.1
pytest-cov==4.1.0                # Coverage reporting
pytest-asyncio==0.21.1           # Async test support
freezegun==1.2.2                 # Time mocking
responses==0.23.3                # HTTP mocking
```

**Test Coverage:** 87% (unit tests for fetcher and notifications)

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Apache Airflow Cluster                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Scheduler  │  │   Webserver  │  │    Worker    │    │
│  │  (triggers)  │  │   (UI 8080)  │  │  (executes)  │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘    │
│         │                                     │             │
│         └──────────────┬──────────────────────┘             │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐  ┌────▼────┐  ┌─────▼──────┐
    │PostgreSQL │  │  Redis  │  │ ClickHouse │
    │ (metadata)│  │(broker) │  │   (DWH)    │
    └───────────┘  └─────────┘  └────┬───────┘
                                      │
                            ┌─────────▼─────────┐
                            │  Market Data DWH  │
                            ├───────────────────┤
                            │ • dim_date        │
                            │ • dim_stock_co... │
                            │ • fact_stock_d... │
                            │ • fact_financi... │
                            │ • fact_dividend   │
                            │ • fact_income_... │
                            └───────────────────┘

External Data Sources:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ vnstock  │  │ yfinance │  │Telegram  │  │  Gemini  │
│   API    │  │   API    │  │ Bot API  │  │   API    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Data Flow

```
1. SCHEDULE TRIGGER (Airflow Scheduler)
   ↓
2. TASK DISPATCHED (Redis → Celery Worker)
   ↓
3. EXTRACT (vnstock API → pandas DataFrame)
   ↓
4. TRANSFORM (pandas_ta: calculate indicators)
   ↓
5. LOAD (ClickHouse INSERT via clickhouse-connect)
   ↓
6. OPTIMIZE (ClickHouse: OPTIMIZE TABLE FINAL)
   ↓
7. NOTIFY (Telegram: Success/Failure message)
```

---

## 4. DAG Workflows

### DAG 1: market_data_evening_batch

**Schedule:** `0 18 * * 1-5` (6 PM Vietnam Time, Mon-Fri)  
**File:** `dags/market_data_evening_batch.py` (357 lines)  
**Purpose:** Fetch EOD (End-of-Day) stock prices and financial data

**Task Graph:**

```
start_pipeline
    ↓
┌───┴────────────────────────┬──────────────────────┬─────────────────┐
│                            │                      │                 │
extract_prices          extract_ratios      extract_dividends   extract_income
    ↓                        ↓                      ↓                 ↓
load_prices             load_ratios         load_dividends      load_income
    │                        │                      │                 │
└───┬────────────────────────┴──────────────────────┴─────────────────┘
    ↓
end_pipeline
```

**Configuration:**

```python
default_args = {
    "owner": "data_engineer",
    "retries": 2,
    "retry_delay": timedelta(minutes=2),
}

dag = DAG(
    dag_id="market_data_evening_batch",
    schedule="0 18 * * 1-5",  # 6 PM, Mon-Fri
    start_date=datetime(2024, 1, 1, tzinfo=local_tz),
    catchup=False,
    tags=["stock-price", "financials", "clickhouse", "evening-batch"],
    on_success_callback=send_success_notification,
    on_failure_callback=send_failure_notification,
)
```

**Stock List:**

```python
STOCKS = ["HPG", "VCB", "VNM", "FPT", "MWG", "VIC"]
```

**Key Features:**

- **Incremental Loading** - Fetches 250 days for indicator calculation, inserts last 7 days only
- **Idempotency** - ClickHouse ReplacingMergeTree handles duplicates
- **Error Handling** - 2 retries with 2-minute delay
- **Notifications** - Telegram alerts on success/failure

---

#### Task: extract_prices

**Function:** Fetch stock prices from vnstock API

```python
@task
def extract_prices():
    price_data = []
    lookback_date = (datetime.today() - timedelta(days=250)).strftime("%Y-%m-%d")
    end_date = datetime.today().strftime("%Y-%m-%d")
    filter_from = (datetime.today() - timedelta(days=7)).strftime("%Y-%m-%d")

    for ticker in STOCKS:
        df_price = fetch_stock_price(ticker, lookback_date, end_date)
        if not df_price.empty:
            # Filter to only last 7 days for insertion
            df_price = df_price[df_price["trading_date"].astype(str) >= filter_from]
            price_data.append(df_price)

    if price_data:
        final_price_df = pd.concat(price_data)
        return final_price_df.to_dict("records")
    return []
```

**Why 250 days?**

- MA200 (200-day moving average) requires 200+ days of data
- Extra 50 days for buffer and indicator warmup

**Why filter to 7 days?**

- Reduces database writes (idempotent pipeline)
- Prevents full historical reload on each run

---

#### Task: load_prices

**Function:** Insert price data into ClickHouse

```python
@task
def load_prices(data):
    client = clickhouse_connect.get_client(
        host=CLICKHOUSE_HOST,
        port=CLICKHOUSE_PORT,
        username=CLICKHOUSE_USER,
        password=CLICKHOUSE_PASSWORD,
    )

    price_cols = [
        "trading_date", "open", "high", "low", "close", "volume",
        "ticker", "daily_return", "ma_50", "ma_200", "rsi_14",
        "macd", "macd_signal", "macd_hist", "source"
    ]

    price_tuples = [[row.get(col) for col in price_cols] for row in data]

    client.insert(
        "market_dwh.fact_stock_daily",
        price_tuples,
        column_names=price_cols,
    )

    # Deduplicate rows (ReplacingMergeTree)
    client.command("OPTIMIZE TABLE market_dwh.fact_stock_daily FINAL")
```

**ClickHouse Optimization:**

- `OPTIMIZE TABLE FINAL` - Merges duplicate rows (keeps latest `ingested_at`)
- Batched inserts - Single INSERT for all tickers
- Columnar storage - Fast aggregation queries

---

### DAG 2: market_news_morning

**Schedule:** `0 7 * * 1-5` (7 AM Vietnam Time, Mon-Fri)  
**File:** `dags/market_news_morning.py`  
**Purpose:** Fetch market news, generate AI summary, send to Telegram

**Task Flow:**

```
fetch_news → summarize_with_gemini → send_telegram_notification
```

**Features:**

- Aggregates news from multiple sources
- Uses Gemini API for intelligent summarization
- Delivers to Telegram chat as morning brief

---

## 5. Data Models

### ClickHouse Schema

**Database:** `market_dwh`

#### dim_date (Date Dimension)

**Purpose:** Calendar reference table

```sql
CREATE TABLE IF NOT EXISTS market_dwh.dim_date (
    date Date,
    year UInt16,
    quarter UInt8,
    month UInt8,
    day UInt8,
    day_of_week UInt8,
    is_weekend UInt8,
    quarter_label String,
    month_name String,
    day_name String
) ENGINE = ReplacingMergeTree()
ORDER BY date;
```

**Records:** 2015-01-01 to 2035-12-31 (pre-populated)

---

#### fact_stock_daily (Daily Prices)

**Purpose:** Time-series stock prices with technical indicators

```sql
CREATE TABLE IF NOT EXISTS market_dwh.fact_stock_daily (
    ticker String,
    trading_date Date,
    open Decimal64(2),
    high Decimal64(2),
    low Decimal64(2),
    close Decimal64(2),
    volume UInt64,
    ma_50 Float64 DEFAULT 0,
    ma_200 Float64 DEFAULT 0,
    rsi_14 Float64 DEFAULT 0,
    daily_return Float64 DEFAULT 0,
    macd Float64 DEFAULT 0,
    macd_signal Float64 DEFAULT 0,
    macd_hist Float64 DEFAULT 0,
    source String DEFAULT 'vnstock',
    ingested_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (ticker, trading_date);
```

**Engine:** `ReplacingMergeTree(ingested_at)`

- Automatically deduplicates rows with same `(ticker, trading_date)`
- Keeps row with latest `ingested_at`
- Enables idempotent pipeline (safe to re-run)

**Indexes:**

- Primary key: `(ticker, trading_date)` - Enables fast range queries
- Granularity: 8192 rows per index mark

**Technical Indicators:**

- **MA50/MA200** - Moving averages (trend identification)
- **RSI-14** - Relative Strength Index (overbought/oversold)
- **MACD** - Moving Average Convergence Divergence (momentum)

---

#### fact_financial_ratios (Quarterly Financials)

**Purpose:** Fundamental analysis metrics

```sql
CREATE TABLE IF NOT EXISTS market_dwh.fact_financial_ratios (
    ticker String,
    fiscal_date Date,
    year UInt16,
    quarter UInt8,

    -- Valuation
    pe_ratio Float64,
    pb_ratio Float64,
    ps_ratio Float64,
    p_cashflow_ratio Float64,
    eps Float64,
    bvps Float64,
    market_cap Float64,

    -- Profitability
    roe Float64,
    roa Float64,
    roic Float64,
    net_profit_margin Float64,

    -- Leverage
    debt_to_equity Float64,
    financial_leverage Float64,

    -- Other
    dividend_yield Float64,
    ingested_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (ticker, year, quarter);
```

**Update Frequency:** Quarterly (after earnings releases)

---

#### fact_dividends (Dividend History)

```sql
CREATE TABLE IF NOT EXISTS market_dwh.fact_dividends (
    ticker String,
    exercise_date Date,
    announcement_date Date,
    ex_right_date Date,
    value Decimal64(2),
    ingested_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (ticker, exercise_date);
```

---

#### fact_income_statement (Income Statements)

```sql
CREATE TABLE IF NOT EXISTS market_dwh.fact_income_statement (
    ticker String,
    year UInt16,
    quarter UInt8,
    revenue Float64,
    year_report_revenue Float64,
    cost_of_good_sold Float64,
    gross_profit Float64,
    operating_profit Float64,
    profit_before_tax Float64,
    profit_after_tax Float64,
    basic_eps Float64,
    diluted_eps Float64,
    ingested_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (ticker, year, quarter);
```

---

### Data Retention Policy

**Current:** No retention policy (infinite storage)

**Recommended (Future):**

```sql
-- Delete data older than 10 years
ALTER TABLE market_dwh.fact_stock_daily
MODIFY TTL trading_date + INTERVAL 10 YEAR;
```

---

## 6. ETL Modules

### Module: fetcher.py

**File:** `dags/etl_modules/fetcher.py`  
**Purpose:** Data extraction and transformation

#### Function: fetch_stock_price

**Signature:**

```python
def fetch_stock_price(ticker: str, start_date: str, end_date: str) -> pd.DataFrame
```

**Implementation:**

```python
import pandas as pd
import pandas_ta as ta
from vnstock import stock_historical_data

def fetch_stock_price(ticker, start_date, end_date):
    """Fetch stock price with technical indicators."""
    # Fetch raw data
    df = stock_historical_data(
        symbol=ticker,
        start_date=start_date,
        end_date=end_date,
        resolution='1D'
    )

    # Calculate technical indicators
    df['ma_50'] = ta.sma(df['close'], length=50)
    df['ma_200'] = ta.sma(df['close'], length=200)
    df['rsi_14'] = ta.rsi(df['close'], length=14)

    macd_result = ta.macd(df['close'])
    df['macd'] = macd_result['MACD_12_26_9']
    df['macd_signal'] = macd_result['MACDs_12_26_9']
    df['macd_hist'] = macd_result['MACDh_12_26_9']

    df['daily_return'] = df['close'].pct_change() * 100
    df['ticker'] = ticker
    df['source'] = 'vnstock'

    return df
```

**Dependencies:**

- `vnstock` - Vietnamese stock data API
- `pandas_ta` - Technical analysis library

**Indicators Calculated:**

- **SMA (Simple Moving Average)** - Trend identification
- **RSI (Relative Strength Index)** - Momentum oscillator (0-100)
- **MACD (Moving Average Convergence Divergence)** - Trend + momentum

---

#### Function: fetch_financial_ratios

**Signature:**

```python
def fetch_financial_ratios(ticker: str) -> pd.DataFrame
```

**Returns:** Quarterly financial ratios (P/E, ROE, Debt/Equity, etc.)

---

#### Function: fetch_dividends

**Signature:**

```python
def fetch_dividends(ticker: str) -> pd.DataFrame
```

**Returns:** Dividend history (cash + stock dividends)

---

#### Function: fetch_income_stmt

**Signature:**

```python
def fetch_income_stmt(ticker: str, period: str = 'quarter') -> pd.DataFrame
```

**Returns:** Income statement (revenue, profit, EPS)

---

### Module: notifications.py

**File:** `dags/etl_modules/notifications.py`  
**Purpose:** Send Telegram notifications on DAG success/failure

#### Function: send_success_notification

```python
from airflow.providers.telegram.hooks.telegram import TelegramHook

def send_success_notification(context):
    """Send success message to Telegram."""
    hook = TelegramHook(telegram_conn_id='telegram_default')

    dag_id = context['dag'].dag_id
    execution_date = context['execution_date']

    message = f"✅ DAG {dag_id} completed successfully!\n" \
              f"📅 Execution: {execution_date}"

    hook.send_message({
        'chat_id': os.getenv('TELEGRAM_CHAT_ID'),
        'text': message
    })
```

#### Function: send_failure_notification

```python
def send_failure_notification(context):
    """Send failure alert to Telegram."""
    hook = TelegramHook(telegram_conn_id='telegram_default')

    dag_id = context['dag'].dag_id
    task_id = context['task_instance'].task_id
    exception = context.get('exception')

    message = f"❌ DAG {dag_id} failed!\n" \
              f"Task: {task_id}\n" \
              f"Error: {str(exception)}"

    hook.send_message({
        'chat_id': os.getenv('TELEGRAM_CHAT_ID'),
        'text': message
    })
```

---

## 7. Infrastructure

### Docker Compose Services

**File:** `docker-compose.yaml` (339 lines)

#### Service: airflow-webserver

```yaml
airflow-webserver:
  build:
    context: .
    dockerfile: Dockerfile
  image: fin-sight-airflow:latest
  command: webserver
  ports:
    - "8080:8080"
  healthcheck:
    test: ["CMD", "curl", "--fail", "http://localhost:8080/health"]
    interval: 30s
    timeout: 10s
    retries: 5
  depends_on:
    - postgres
    - redis
    - clickhouse-server
```

**Access:** http://localhost:8080 (admin/admin)

---

#### Service: airflow-scheduler

```yaml
airflow-scheduler:
  <<: *airflow-common
  command: scheduler
  healthcheck:
    test: ["CMD", "airflow", "jobs", "check", "--job-type", "SchedulerJob"]
```

**Responsibility:** Triggers DAGs based on schedule

---

#### Service: airflow-worker

```yaml
airflow-worker:
  <<: *airflow-common
  command: celery worker
  healthcheck:
    test: ["CMD-SHELL", "celery --app airflow.providers.celery.executors.celery_executor.app inspect ping -d celery@$HOSTNAME"]
```

**Responsibility:** Executes tasks dispatched by scheduler

---

#### Service: postgres

```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_USER: airflow
    POSTGRES_PASSWORD: airflow
    POSTGRES_DB: airflow
  volumes:
    - postgres-db-volume:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD", "pg_isready", "-U", "airflow"]
```

**Purpose:** Airflow metadata storage

---

#### Service: clickhouse-server

```yaml
clickhouse-server:
  image: clickhouse/clickhouse-server:latest
  ports:
    - "8123:8123" # HTTP interface
    - "9000:9000" # Native protocol
  volumes:
    - clickhouse-data:/var/lib/clickhouse
    - ./sql:/docker-entrypoint-initdb.d
  healthcheck:
    test: ["CMD", "clickhouse-client", "--query", "SELECT 1"]
```

**Purpose:** OLAP data warehouse

**Initialization:**

- SQL scripts in `sql/init_schema.sql` run on first startup
- Creates `market_dwh` database and tables automatically

---

#### Service: redis

```yaml
redis:
  image: redis:7.2-alpine
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

**Purpose:** Celery message broker

---

#### Service: flower

```yaml
flower:
  <<: *airflow-common
  command: celery flower
  ports:
    - "5555:5555"
  healthcheck:
    test: ["CMD", "curl", "--fail", "http://localhost:5555/"]
```

**Purpose:** Celery monitoring UI

**Access:** http://localhost:5555

---

### Custom Airflow Image

**File:** `Dockerfile`

```dockerfile
FROM apache/airflow:3.1.3-python3.12

USER root
# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev && \
    apt-get clean

USER airflow
# Install Python dependencies
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
```

**Why Custom Image?**

- Includes project-specific dependencies (vnstock, pandas_ta)
- Pre-installs ClickHouse driver
- Adds testing libraries (pytest)

---

### Environment Configuration

**File:** `.env` (not committed)

```bash
# Telegram Notifications
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_CHAT_ID=<your-chat-id>

# Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# ClickHouse
CLICKHOUSE_HOST=clickhouse-server
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=

# Airflow
AIRFLOW_UID=50000
```

---

## 8. Testing Strategy

### Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── unit/
│   ├── test_fetcher.py      # ETL functions
│   └── test_notifications.py # Telegram/Gemini notifications
├── integration/             # (Future)
├── fixtures/
│   └── sample_data.json     # Mock stock data
└── mocks/
    ├── vnstock_mock.py      # Mock vnstock API
    └── api_responses.py     # Mock API responses
```

### Running Tests

```bash
cd services/data-pipeline

# All tests
pytest

# With coverage
pytest --cov=dags --cov-report=html

# Specific test file
pytest tests/unit/test_fetcher.py

# Verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

### Test Coverage

**Current:** 87% coverage

**Coverage Report:**

```
dags/etl_modules/fetcher.py           92%
dags/etl_modules/notifications.py    85%
dags/market_data_evening_batch.py    78%
```

### Sample Test

```python
# tests/unit/test_fetcher.py
import pytest
from unittest.mock import patch, MagicMock
from dags.etl_modules.fetcher import fetch_stock_price

@patch('dags.etl_modules.fetcher.stock_historical_data')
def test_fetch_stock_price(mock_vnstock):
    # Arrange
    mock_vnstock.return_value = pd.DataFrame({
        'close': [100, 101, 102, 103, 104],
        'open': [99, 100, 101, 102, 103],
        'high': [101, 102, 103, 104, 105],
        'low': [98, 99, 100, 101, 102],
        'volume': [1000, 1100, 1200, 1300, 1400]
    })

    # Act
    result = fetch_stock_price('HPG', '2024-01-01', '2024-01-05')

    # Assert
    assert len(result) == 5
    assert 'ma_50' in result.columns
    assert 'rsi_14' in result.columns
    assert result['ticker'].iloc[0] == 'HPG'
```

---

## 9. Operations & Monitoring

### Airflow UI

**URL:** http://localhost:8080

**Features:**

- DAG status dashboard
- Task instance logs
- Gantt chart visualization
- DAG run history
- Task duration metrics

**Admin Credentials:**

- Username: `admin`
- Password: `admin` (change in production!)

---

### Flower (Celery Monitoring)

**URL:** http://localhost:5555

**Features:**

- Worker health status
- Task queue length
- Task success/failure rates
- Worker resource usage

---

### ClickHouse Monitoring

**Query Interface:** http://localhost:8123

**Sample Queries:**

```sql
-- Check latest prices
SELECT ticker, trading_date, close, rsi_14, macd
FROM market_dwh.fact_stock_daily
WHERE trading_date = today() - 1
ORDER BY ticker;

-- Table row counts
SELECT
    table AS table_name,
    formatReadableSize(sum(bytes)) AS size,
    sum(rows) AS rows
FROM system.parts
WHERE database = 'market_dwh' AND active
GROUP BY table;

-- Query performance
SELECT
    query_duration_ms,
    query,
    memory_usage
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 10;
```

---

### Logging

**Airflow Logs:** `logs/` directory

- DAG run logs
- Task instance logs
- Scheduler logs

**Log Rotation:**

```python
# airflow.cfg
[logging]
base_log_folder = /opt/airflow/logs
logging_level = INFO
fab_logging_level = WARN
log_retention_days = 30
```

---

### Alerting

**Telegram Integration:**

- Success notifications after DAG completion
- Failure alerts with error details
- Configurable via `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`

**Sample Alert:**

```
❌ DAG market_data_evening_batch failed!
Task: load_prices
Error: ClickHouse connection timeout
```

---

## 10. Future Enhancements

### Planned Features

#### 1. Global Markets Support

**New Data Sources:**

- **yfinance** - US/Global stocks (already in requirements.txt)
- **CoinGecko API** - Cryptocurrency prices
- **MetalPriceAPI** - Gold, Silver, Oil

**Schema Extension:**

```sql
ALTER TABLE market_dwh.fact_stock_daily
ADD COLUMN market_type Enum8('VN'=1, 'US'=2, 'CRYPTO'=3, 'COMMODITY'=4) DEFAULT 'VN',
ADD COLUMN base_currency String DEFAULT 'VND';
```

---

#### 2. Real-Time Data Ingestion

**WebSocket Streaming:**

```python
# New DAG: market_data_realtime_stream
import websockets

async def stream_prices():
    async with websockets.connect('wss://vnstock-stream.com') as ws:
        while True:
            data = await ws.recv()
            # Insert to ClickHouse (micro-batching)
```

---

#### 3. User Holdings Snapshot

**Pre-Aggregation for API:**

```sql
CREATE TABLE IF NOT EXISTS market_dwh.fact_user_holdings (
    user_id UUID,
    ticker String,
    quantity Decimal64(8),
    avg_cost_basis Decimal64(2),
    snapshot_date Date,
    ingested_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(ingested_at)
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (user_id, ticker, snapshot_date);
```

**New DAG:**

```python
# Schedule: Every 5 minutes
@task
def calculate_user_holdings():
    """Aggregate user transactions + latest prices."""
    # Join PostgreSQL (user transactions) + ClickHouse (prices)
    # Insert to fact_user_holdings
```

---

#### 4. Enhanced Monitoring

**Metrics:**

- Data freshness (time since last update)
- Pipeline SLA violations
- API error rates

**Tools:**

- Prometheus for metrics collection
- Grafana for dashboards
- Alertmanager for alerting

---

#### 5. Data Quality Checks

**Great Expectations Integration:**

```python
@task
def validate_price_data(df):
    """Data quality checks."""
    # Check for nulls
    assert df['close'].notna().all()

    # Check for outliers (price change > 20%)
    assert df['daily_return'].abs().max() < 20

    # Check for duplicates
    assert df.duplicated(subset=['ticker', 'trading_date']).sum() == 0
```

---

#### 6. Incremental Backfill

**Airflow Backfill Command:**

```bash
airflow dags backfill market_data_evening_batch \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --reset-dagruns
```

---

## Architecture Decisions

### Why Apache Airflow?

- **Mature orchestration** - Battle-tested in production
- **Python-native** - Easy ETL with pandas
- **Rich ecosystem** - 100+ provider packages
- **UI for monitoring** - No custom dashboard needed

### Why ClickHouse over PostgreSQL?

- **Columnar storage** - 100x faster for analytics
- **Compression** - 10:1 compression ratio
- **Scalability** - Handles billions of rows
- **SQL interface** - Familiar query language

### Why CeleryExecutor over LocalExecutor?

- **Horizontal scaling** - Add workers as needed
- **Task distribution** - Parallel execution
- **Production-ready** - Standard for large deployments

### Why ReplacingMergeTree?

- **Idempotency** - Safe to re-run pipelines
- **Automatic deduplication** - No manual cleanup
- **Eventually consistent** - OPTIMIZE TABLE finalizes

---

## Known Limitations

1. **Manual Stock List** - Hardcoded ticker list (HPG, VCB, etc.)
2. **No Real-Time** - Daily batch only (6 PM)
3. **Single Region** - Vietnam market only (US/crypto planned)
4. **No Data Quality Checks** - Assumes vnstock data is clean
5. **No Incremental Backfill** - Full historical reload on failure

---

_Last updated: December 26, 2025_
