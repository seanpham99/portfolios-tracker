import argparse
import pandas as pd
import clickhouse_connect
import os
import sys
import logging

# Add project root to path to import dags.etl_modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dags.etl_modules.fetcher import fetch_stock_price, fetch_financial_ratios

try:
    from vnstock import Listing
except ImportError:
    logging.warning("vnstock not installed, company dimension update will fail.")
    Listing = None

# CONFIG
STOCKS = ["HPG", "VCB", "VNM", "FPT", "MWG"]
CLICKHOUSE_HOST = os.getenv(
    "CLICKHOUSE_HOST", "localhost"
)  # Default to localhost for manual script
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", 8123))
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def manual_load(start_date, end_date, price_only=False, ratios_only=False):
    logging.info(f"Starting manual load from {start_date} to {end_date}")

    # Determine what to fetch
    fetch_price = True
    fetch_ratios = True

    if price_only:
        fetch_ratios = False
        logging.info("Mode: Price Only")
    elif ratios_only:
        fetch_price = False
        logging.info("Mode: Ratios Only")
    else:
        logging.info("Mode: Full Load (Price + Ratios)")

    price_data = []
    ratio_data = []

    for ticker in STOCKS:
        # 1. Fetch Price
        if fetch_price:
            df_price = fetch_stock_price(ticker, start_date, end_date)
            if not df_price.empty:
                price_data.append(df_price)

        # 2. Fetch Financial Ratios
        if fetch_ratios:
            df_ratio = fetch_financial_ratios(ticker)
            if not df_ratio.empty:
                ratio_data.append(df_ratio)

    # Connect to ClickHouse
    logging.info(f"Connecting to ClickHouse at {CLICKHOUSE_HOST}:{CLICKHOUSE_PORT}...")
    try:
        client = clickhouse_connect.get_client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            username=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD,
        )
    except Exception as e:
        logging.error(f"Failed to connect to ClickHouse: {e}")
        return

    # Load Prices
    if fetch_price:
        if price_data:
            final_price_df = pd.concat(price_data)
            prices = final_price_df.to_dict("records")
            logging.info(f"Inserting {len(prices)} price rows...")

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
            logging.info("Price insertion complete.")
            # Force deduplication
            client.command("OPTIMIZE TABLE market_dwh.fact_stock_daily FINAL")
            logging.info("Optimized fact_stock_daily.")
        else:
            logging.warning("No price data fetched.")

    # Load Ratios
    if fetch_ratios:
        if ratio_data:
            final_ratio_df = pd.concat(ratio_data)
            ratios = final_ratio_df.to_dict("records")
            logging.info(f"Inserting {len(ratios)} financial ratio rows...")

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
                ratio_tuples.append([row.get(col, 0) for col in ratio_cols])

            client.insert(
                "market_dwh.fact_financial_ratios",
                ratio_tuples,
                column_names=ratio_cols,
            )
            logging.info("Financial ratio insertion complete.")
            # Force deduplication
            client.command("OPTIMIZE TABLE market_dwh.fact_financial_ratios FINAL")
            logging.info("Optimized fact_financial_ratios.")
        else:
            logging.warning("No financial ratio data fetched.")


def update_company_dimension(client):
    if not Listing:
        logging.error("vnstock not available.")
        return

    logging.info("Fetching company list from vnstock...")
    try:
        listing = Listing(source="VCI")
        df_companies = listing.symbols_by_exchange()

        if not df_companies.empty:
            # Filter out DELISTED companies (case-insensitive check)
            df_companies = df_companies[
                df_companies["exchange"].str.upper() != "DELISTED"
            ]

            df_insert = df_companies[["symbol", "organ_name", "exchange"]].copy()
            # Handle potential None/NaN values in organ_name robustly
            df_insert["organ_name"] = df_insert["organ_name"].apply(
                lambda x: str(x) if pd.notnull(x) and x is not None else ""
            )
            client.insert_df("market_dwh.dim_stock_companies", df_insert)
            logging.info(
                f"Inserted {len(df_insert)} companies into market_dwh.dim_stock_companies"
            )
            # Force deduplication
            client.command("OPTIMIZE TABLE market_dwh.dim_stock_companies FINAL")
            logging.info("Optimized dim_stock_companies.")
        else:
            logging.warning("No company data fetched from vnstock.")

    except Exception as e:
        logging.error(f"Failed to fetch or insert company data: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manual Stock Data Loader")

    # Mutually exclusive group for mode
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--price-only", action="store_true", help="Fetch only stock prices"
    )
    group.add_argument(
        "--ratios-only", action="store_true", help="Fetch only financial ratios"
    )

    parser.add_argument(
        "--update-companies",
        action="store_true",
        help="Update company dimension table from vnstock",
    )
    parser.add_argument("--start", required=False, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", required=False, help="End date (YYYY-MM-DD)")

    args = parser.parse_args()

    if args.update_companies:
        # Create client just for this operation if running from CLI
        try:
            client = clickhouse_connect.get_client(
                host=CLICKHOUSE_HOST,
                port=CLICKHOUSE_PORT,
                username=CLICKHOUSE_USER,
                password=CLICKHOUSE_PASSWORD,
            )
            update_company_dimension(client)
        except Exception as e:
            logging.error(f"Failed to connect to ClickHouse: {e}")

    if args.start and args.end:
        manual_load(args.start, args.end, args.price_only, args.ratios_only)
