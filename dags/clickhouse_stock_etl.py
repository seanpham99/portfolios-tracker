from airflow import DAG
from airflow.decorators import task
from datetime import datetime, timedelta
import pandas as pd
import clickhouse_connect
import os
import sys

# Add dags directory to path so we can import etl_modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl_modules.fetcher import fetch_stock_price
from etl_modules.fetcher import fetch_financial_ratios

# CONFIG
STOCKS = ["HPG", "VCB", "VNM", "FPT", "MWG"]
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "clickhouse-server")
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", 8123))
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "")

default_args = {
    "owner": "data_engineer",
    "retries": 2,
    "retry_delay": timedelta(minutes=2),
}

with DAG(
    dag_id="dwh_clickhouse_loader",
    default_args=default_args,
    schedule_interval="0 18 * * 1-5",  # 6 PM Mon-Fri
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=["dwh", "clickhouse"],
) as dag:

    @task
    def extract_and_transform():
        price_data = []
        ratio_data = []

        print("RUNNING DAILY INCREMENTAL (7 DAYS)")
        start_date = (datetime.today() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = datetime.today().strftime("%Y-%m-%d")

        print(f"Fetching data from {start_date} to {end_date}")

        for ticker in STOCKS:
            # 1. Fetch Price
            df_price = fetch_stock_price(ticker, start_date, end_date)
            if not df_price.empty:
                price_data.append(df_price)

            # 2. Fetch Financial Ratios
            # Note: Financials are quarterly, so date range is less relevant for the API call
            # (it returns recent quarters), but good to keep in mind.
            df_ratio = fetch_financial_ratios(ticker)
            if not df_ratio.empty:
                ratio_data.append(df_ratio)

        results = {}

        if price_data:
            final_price_df = pd.concat(price_data)
            results["prices"] = final_price_df.to_dict("records")
        else:
            results["prices"] = []

        if ratio_data:
            final_ratio_df = pd.concat(ratio_data)
            results["ratios"] = final_ratio_df.to_dict("records")
        else:
            results["ratios"] = []

        if not results["prices"] and not results["ratios"]:
            print("No data fetched at all.")
            return None

        return results

    @task
    def load_to_clickhouse(data):
        if not data:
            print("No data to load.")
            return

        print(
            f"Connecting to ClickHouse at {CLICKHOUSE_HOST}:{CLICKHOUSE_PORT} as {CLICKHOUSE_USER}"
        )
        client = clickhouse_connect.get_client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            username=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD,
        )

        # 1. Load Prices
        prices = data.get("prices", [])
        if prices:
            print(f"Inserting {len(prices)} price rows...")
            price_cols = [
                "trading_date",
                "open",
                "high",
                "low",
                "close",
                "volume",
                "ticker",
                "source",
            ]
            price_tuples = []
            for row in prices:
                price_tuples.append([row.get(col) for col in price_cols])

            client.insert(
                "market_dwh.fact_stock_daily",
                price_tuples,
                column_names=price_cols,
            )
            print("Price insertion complete.")

        # 2. Load Ratios
        ratios = data.get("ratios", [])
        if ratios:
            print(f"Inserting {len(ratios)} financial ratio rows...")
            ratio_cols = [
                "ticker",
                "fiscal_date",
                "year",
                "quarter",
                "pe_ratio",
                "pb_ratio",
                "roe",
                "net_profit_margin",
                "debt_to_equity",
            ]
            ratio_tuples = []
            for row in ratios:
                # Ensure defaults for missing keys if any
                ratio_tuples.append([row.get(col, 0) for col in ratio_cols])

            client.insert(
                "market_dwh.fact_financial_ratios",
                ratio_tuples,
                column_names=ratio_cols,
            )
            print("Financial ratio insertion complete.")

    # Orchestration
    raw_data = extract_and_transform()
    load_to_clickhouse(raw_data)
