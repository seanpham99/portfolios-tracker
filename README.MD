# Fin-Sight 📈

**Fin-Sight** is a comprehensive data engineering platform designed to automate the ingestion, processing, and analysis of Vietnamese stock market data. Built with a modern tech stack featuring **Apache Airflow** and **ClickHouse**, it provides a robust foundation for financial data analysis, technical indicator calculation, and automated market intelligence.

---

## 🚀 Key Features

- **Automated ETL Pipelines**:
  - **Evening Batch**: Automatically fetches EOD (End-of-Day) stock prices, financial ratios, dividends, and income statements.
  - **Morning Brief**: Aggregates the latest market news and delivers summaries to your device.
- **Technical Analysis Engine**: Built-in calculation of key indicators including **MA50, MA200, RSI, MACD**, and more using `pandas_ta`.
- **High-Performance Data Warehouse**: Utilizes **ClickHouse** for lightning-fast storage and querying of high-volume financial data.
- **Real-time Notifications**: Integrated **Telegram** alerts for pipeline status updates and daily market news summaries.
- **Data Enrichment**: Enriches raw market data with derived metrics and financial health indicators.

---

## 🛠 Tech Stack

- **Orchestration**: [Apache Airflow](https://airflow.apache.org/) (LocalExecutor)
- **Data Warehouse**: [ClickHouse](https://clickhouse.com/)
- **Metadata Database**: [PostgreSQL](https://www.postgresql.org/)
- **Data Source**: `vnstock` (Vietnamese Stock Market API)
- **Containerization**: Docker & Docker Compose
- **Language**: Python 3.12

---

## 📂 Project Structure

```bash
fin-sight/
├── apps/
│   └── web/                    # Next.js 16 (App Router) portfolio tracking UI
│       ├── package.json
│       ├── src/
│       └── next.config.ts
├── services/
...
## 🖥️ Web App (apps/web)

The React app is the intended UI for tracking portfolios and visualizing insights, built with **Next.js 16**.

### Run locally

```bash
cd apps/web
pnpm install
pnpm run dev
```

The dev server will print the local URL (typically <http://localhost:3001>).

---

## 📊 Data Pipelines

### 1. Market Data Evening Batch (`market_data_evening_batch`)

Runs every weekday at **6:00 PM (UTC+7)**.

- **Tasks**:
  - `extract_prices`: Fetches OHLCV data for tracked stocks.
  - `extract_ratios`: Retrieves quarterly financial ratios (P/E, ROE, etc.).
  - `extract_fundamentals`: Gathers dividend history and income statements.
  - `load_*`: Inserts processed data into ClickHouse tables (`fact_stock_daily`, `fact_financial_ratios`, etc.).

### 2. Market News Morning (`market_news_morning`)

Runs every weekday at **7:00 AM (UTC+7)**.

- **Tasks**:
  - `extract_news`: Scrapes latest news related to tracked tickers.
  - `load_news`: Stores news metadata in ClickHouse.
  - `send_news_digest`: Sends a consolidated news summary via Telegram.

---

## 🗄️ Data Model (ClickHouse)

The Data Warehouse is initialized with the following core tables in the `market_dwh` database:

- **`fact_stock_daily`**: Daily stock prices and technical indicators.
- **`fact_financial_ratios`**: Quarterly financial health metrics.
- **`fact_dividends`**: Historical dividend payouts.
- **`fact_income_statement`**: Quarterly/Yearly income statements.
- **`fact_news`**: Market news and events.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
