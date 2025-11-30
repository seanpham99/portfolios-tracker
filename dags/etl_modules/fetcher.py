import yfinance as yf
import pandas as pd
import logging

# Try to import vnstock, if fails, we will rely on yfinance
try:
    from vnstock import Quote, Finance

    VNSTOCK_AVAILABLE = True
except ImportError:
    logging.warning(
        "Could not import 'Quote' or 'Finance' from 'vnstock'. Will use yfinance as fallback."
    )
    VNSTOCK_AVAILABLE = False


def fetch_stock_price(symbol, start_date, end_date):
    """
    Tries to fetch from VNSTOCK (using Quote API). If fails/empty, falls back to YFINANCE.
    Returns: Standardized DataFrame for ClickHouse.
    """
    logging.info(f"Attempting fetch for {symbol}...")

    df = pd.DataFrame()

    # 1. Try Primary Source (vnstock)
    if VNSTOCK_AVAILABLE:
        try:
            logging.info(f"Fetching {symbol} via VNSTOCK (Quote API)...")
            # vnstock Quote API usage
            quote = Quote(symbol=symbol, source="vci")
            df = quote.history(start=start_date, end=end_date, interval="D")

            if df is None or df.empty:
                raise ValueError("Empty data from vnstock")

            # Normalize Columns
            # vnstock Quote.history usually returns: time, open, high, low, close, volume, ticker (or similar)
            # We need to inspect the columns if possible, but let's assume standard names or map them
            df.columns = [c.lower() for c in df.columns]

            rename_map = {"time": "trading_date", "date": "trading_date"}
            df.rename(columns=rename_map, inplace=True)

            # Ensure required columns exist
            required_cols = ["trading_date", "open", "high", "low", "close", "volume"]
            if not all(col in df.columns for col in required_cols):
                logging.warning(f"vnstock data missing columns: {df.columns}")
                raise ValueError("Invalid columns from vnstock")

            df = df[required_cols]
            df["ticker"] = symbol
            df["source"] = "vnstock"

        except Exception as e:
            logging.warning(
                f"VNSTOCK failed for {symbol} ({e}). Falling back to YFINANCE..."
            )
            df = pd.DataFrame()  # Reset

    # 2. Fallback Source (yfinance)
    if df.empty:
        # Note: yfinance needs '.VN' suffix for Vietnamese stocks
        yf_symbol = f"{symbol}.VN" if not symbol.endswith(".VN") else symbol
        logging.info(f"Fetching {yf_symbol} via YFINANCE...")

        try:
            df_yf = yf.download(
                yf_symbol, start=start_date, end=end_date, progress=False
            )

            if df_yf.empty:
                logging.error(f"YFINANCE also failed for {symbol}.")
                return pd.DataFrame()  # Return empty if both fail

            df_yf.reset_index(inplace=True)

            # Normalize Columns (yfinance uses Title Case)
            df_yf["ticker"] = symbol
            df_yf["source"] = "yfinance"
            df_yf.rename(
                columns={
                    "Date": "trading_date",
                    "Open": "open",
                    "High": "high",
                    "Low": "low",
                    "Close": "close",
                    "Volume": "volume",
                },
                inplace=True,
            )

            # Flatten MultiIndex columns if present (yfinance update)
            if isinstance(df_yf.columns, pd.MultiIndex):
                df_yf.columns = df_yf.columns.get_level_values(0)

            # Ensure columns exist after rename
            required_cols = [
                "trading_date",
                "open",
                "high",
                "low",
                "close",
                "volume",
                "ticker",
                "source",
            ]
            # Check if rename worked (sometimes yfinance returns different casing)
            df_yf.columns = [c.lower() for c in df_yf.columns]
            # Remap back to expected
            col_map = {"date": "trading_date"}
            df_yf.rename(columns=col_map, inplace=True)

            # Filter
            available_cols = [c for c in required_cols if c in df_yf.columns]
            if len(available_cols) < len(required_cols):
                logging.error(f"Missing columns in yfinance data: {df_yf.columns}")
                return pd.DataFrame()

            df = df_yf[required_cols]

        except Exception as yf_e:
            logging.error(f"YFINANCE exception for {symbol}: {yf_e}")
            return pd.DataFrame()

    # 3. Final Type Conversion for ClickHouse
    if df.empty:
        return df

    # Ensure trading_date is date object
    if not pd.api.types.is_datetime64_any_dtype(df["trading_date"]):
        df["trading_date"] = pd.to_datetime(df["trading_date"])

    df["trading_date"] = df["trading_date"].dt.date
    df[["open", "high", "low", "close"]] = df[["open", "high", "low", "close"]].astype(
        float
    )
    df["volume"] = df["volume"].astype(int)

    return df


def fetch_financial_ratios(symbol):
    """
    Fetches financial ratios using vnstock Finance API.
    Returns DataFrame with columns: ticker, fiscal_date, year, quarter, pe_ratio, pb_ratio, roe, net_profit_margin, debt_to_equity
    """
    if not VNSTOCK_AVAILABLE:
        logging.warning("VNSTOCK not available, skipping financial ratios.")
        return pd.DataFrame()

    logging.info(f"Fetching financial ratios for {symbol}...")
    try:
        finance = Finance(symbol=symbol, source="VCI")
        # Fetch quarterly ratios
        df = finance.ratio(report_range="quarterly", lang="en")

        if df is None or df.empty:
            logging.warning(f"No financial ratios found for {symbol}")
            return pd.DataFrame()

        # Log columns for debugging
        print(f"Ratio columns for {symbol}: {df.columns.tolist()}")

        # Flatten MultiIndex if present
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = ["_".join(map(str, col)).strip() for col in df.columns.values]
            print(f"Flattened columns: {df.columns.tolist()}")

        # Helper to find column case-insensitive
        def get_col(name, candidates):
            for c in candidates:
                if name.lower() in str(c).lower():
                    return c
            return None

        cols = df.columns.tolist()

        # Create a standardized DataFrame
        out_df = pd.DataFrame()
        out_df["ticker"] = [symbol] * len(df)

        # Safely get year and quarter
        year_col = get_col("yearReport", cols)
        quarter_col = get_col("lengthReport", cols)  # or fiscalDate

        if year_col:
            out_df["year"] = df[year_col].astype(int)
        else:
            logging.warning(f"'yearReport' column missing for {symbol}")
            out_df["year"] = 0

        if quarter_col:
            out_df["quarter"] = df[quarter_col].astype(int)
        else:
            logging.warning(f"'lengthReport' column missing for {symbol}")
            out_df["quarter"] = 0

        pe_col = get_col("P/E", cols) or get_col("Price to Earning", cols)
        pb_col = get_col("P/B", cols) or get_col("Price to Book", cols)
        roe_col = get_col("ROE", cols)
        npm_col = get_col("Net Profit Margin", cols) or get_col("Net Margin", cols)

        out_df["pe_ratio"] = df[pe_col] if pe_col else 0.0
        out_df["pb_ratio"] = df[pb_col] if pb_col else 0.0
        out_df["roe"] = df[roe_col] if roe_col else 0.0
        out_df["net_profit_margin"] = df[npm_col] if npm_col else 0.0

        # Construct fiscal_date (end of quarter)
        def get_quarter_end(row):
            y = row["year"]
            q = row["quarter"]
            if q == 1:
                return pd.Timestamp(f"{y}-03-31").date()
            elif q == 2:
                return pd.Timestamp(f"{y}-06-30").date()
            elif q == 3:
                return pd.Timestamp(f"{y}-09-30").date()
            elif q == 4:
                return pd.Timestamp(f"{y}-12-31").date()
            return pd.Timestamp(f"{y}-01-01").date()  # Fallback

        out_df["fiscal_date"] = out_df.apply(get_quarter_end, axis=1)

        # Debt to Equity needs Balance Sheet usually, but maybe in ratios?
        out_df["debt_to_equity"] = 0.0  # Will fill from Balance Sheet or if found here

        return out_df

    except Exception as e:
        logging.error(f"Error fetching ratios for {symbol}: {e}")
        return pd.DataFrame()


def fetch_balance_sheet(symbol):
    """
    Fetches balance sheet to calculate Debt/Equity if needed, or other metrics.
    """
    if not VNSTOCK_AVAILABLE:
        return pd.DataFrame()

    try:
        finance = Finance(symbol=symbol, source="VCI")
        df = finance.balance_sheet(period="quarter", lang="en")
        # Logic to extract Debt and Equity
        return df
    except Exception as e:
        logging.error(f"Error fetching BS for {symbol}: {e}")
        return pd.DataFrame()
