import pandas as pd
import pandas_ta as ta
import logging
import numpy as np
from vnstock import Quote, Finance, Company


def clean_decimal_cols(df, cols):
    """
    Helper to robustly clean columns destined for ClickHouse Decimal types.
    Replaces NaN, None, and Infinity with 0.
    """
    for col in cols:
        if col in df.columns:
            # 1. Coerce to numeric (turns strings/garbage into NaN)
            df[col] = pd.to_numeric(df[col], errors="coerce")
            # 2. Replace Infinity with NaN (so we can fillna them next)
            df[col] = df[col].replace([np.inf, -np.inf], np.nan)
            # 3. Fill NaN with 0
            df[col] = df[col].fillna(0)
    return df


def fetch_stock_price(symbol, start_date, end_date):
    """
    Fetches stock prices. Handles NaN cleanup for ClickHouse Decimal compatibility.
    """
    logging.info(f"Attempting fetch for {symbol}...")
    df = pd.DataFrame()

    try:
        logging.info(f"Fetching {symbol} via VNSTOCK...")
        quote = Quote(symbol=symbol, source="vci")
        df = quote.history(start=start_date, end=end_date, interval="D")

        if df is None or df.empty:
            raise ValueError("Empty data from vnstock")

        df.columns = [c.lower() for c in df.columns]
        rename_map = {"time": "trading_date", "date": "trading_date"}
        df.rename(columns=rename_map, inplace=True)

        required_cols = ["trading_date", "open", "high", "low", "close", "volume"]
        if not all(col in df.columns for col in required_cols):
            raise ValueError("Invalid columns from vnstock")

        df = df[required_cols]
        df["ticker"] = symbol
        df["source"] = "vnstock"

    except Exception as e:
        logging.warning(f"VNSTOCK failed for {symbol} ({e}).")
        df = pd.DataFrame()

    if df.empty:
        return df

    # Type Conversion & Cleanup
    if not pd.api.types.is_datetime64_any_dtype(df["trading_date"]):
        df["trading_date"] = pd.to_datetime(df["trading_date"])
    df["trading_date"] = df["trading_date"].dt.date

    # Clean Price Columns for Decimal Types
    # If these have NaNs, ClickHouse will crash
    decimal_cols = ["open", "high", "low", "close"]
    df = clean_decimal_cols(df, decimal_cols)

    # Volume is Int
    df["volume"] = df["volume"].fillna(0).astype(int)

    try:
        # Temp Index for calculations
        df["calc_date"] = pd.to_datetime(df["trading_date"])
        df.set_index("calc_date", inplace=True)
        df.sort_index(inplace=True)

        # Calculate
        df["ma_50"] = ta.sma(df["close"], length=50)
        df["ma_200"] = ta.sma(df["close"], length=200)
        df["rsi_14"] = ta.rsi(df["close"], length=14)
        df["daily_return"] = df["close"].pct_change() * 100

        # Backfill first, then fill remaining NaNs with 0
        # This prevents "crash to zero" lines on charts
        df["ma_50"] = df["ma_50"].bfill().fillna(0)
        df["ma_200"] = df["ma_200"].bfill().fillna(0)
        df["rsi_14"] = df["rsi_14"].bfill().fillna(0)
        df["daily_return"] = df["daily_return"].fillna(0)

        df.reset_index(drop=True, inplace=True)

    except Exception as e:
        logging.error(f"Error calculating indicators for {symbol}: {e}", exc_info=True)
        # Ensure columns exist even if calc failed
        for c in ["ma_50", "ma_200", "rsi_14", "daily_return"]:
            df[c] = 0.0

    return df


def fetch_financial_ratios(symbol):
    """
    Fetches financial ratios.
    """
    logging.info(f"Fetching ratios for {symbol}...")
    try:
        finance = Finance(symbol=symbol, source="VCI")
        df = finance.ratio(report_range="quarterly", lang="en")

        if df is None or df.empty:
            return pd.DataFrame()

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = ["_".join(map(str, col)).strip() for col in df.columns.values]

        # Helper to find column case-insensitive
        cols = df.columns.tolist()

        def get_col(name):
            for c in cols:
                if name.lower() in str(c).lower():
                    return c
            return None

        out_df = pd.DataFrame()
        out_df["ticker"] = [symbol] * len(df)

        # Extract Year/Quarter
        year_col = get_col("yearReport")
        quarter_col = get_col("lengthReport")

        if not year_col or not quarter_col:
            return pd.DataFrame()

        out_df["year"] = df[year_col].fillna(0).astype(int)
        out_df["quarter"] = df[quarter_col].fillna(0).astype(int)

        # Extract Ratios
        out_df["pe_ratio"] = df[get_col("P/E")].fillna(0) if get_col("P/E") else 0.0
        out_df["pb_ratio"] = df[get_col("P/B")].fillna(0) if get_col("P/B") else 0.0
        out_df["roe"] = df[get_col("ROE")].fillna(0) if get_col("ROE") else 0.0
        out_df["net_profit_margin"] = (
            df[get_col("Net Profit Margin")].fillna(0)
            if get_col("Net Profit Margin")
            else 0.0
        )
        out_df["debt_to_equity"] = (
            df[get_col("Debt/Equity")].fillna(0) if get_col("Debt/Equity") else 0.0
        )

        # Construct Date
        def get_quarter_end(row):
            y = row["year"]
            q = row["quarter"]
            if q == 1:
                return pd.Timestamp(f"{y}-03-31").date()
            if q == 2:
                return pd.Timestamp(f"{y}-06-30").date()
            if q == 3:
                return pd.Timestamp(f"{y}-09-30").date()
            if q == 4:
                return pd.Timestamp(f"{y}-12-31").date()
            return pd.Timestamp(f"{y}-01-01").date()

        out_df["fiscal_date"] = out_df.apply(get_quarter_end, axis=1)

        # Clean Ratios - Ensure no NaNs or Inf
        out_df = clean_decimal_cols(
            out_df,
            ["pe_ratio", "pb_ratio", "roe", "net_profit_margin", "debt_to_equity"],
        )

        return out_df

    except Exception as e:
        logging.error(f"Error fetching ratios for {symbol}: {e}", exc_info=True)
        return pd.DataFrame()


def fetch_income_stmt(symbol):
    """
    Fetches income statement.
    """
    try:
        finance = Finance(symbol=symbol, source="VCI")
        try:
            df = finance.income_statement(period="quarter", lang="en", dropna=True)
        except AttributeError:
            return pd.DataFrame()

        if df is None or df.empty:
            return pd.DataFrame()

        # Mapping
        mapping = {
            "Net Sales": "revenue",
            "Cost of Sales": "cost_of_goods_sold",
            "Gross Profit": "gross_profit",
            "Operating Profit/Loss": "operating_profit",
            "Net Profit For the Year": "net_profit_post_tax",
        }
        df.rename(columns=mapping, inplace=True)

        required_metrics = list(mapping.values())
        df_final = df.copy()

        # Ensure ticker
        if "ticker" not in df_final.columns:
            df_final["ticker"] = symbol

        # Handle Date
        if "yearReport" in df_final.columns and "lengthReport" in df_final.columns:
            df_final["year"] = df_final["yearReport"]
            df_final["quarter"] = df_final["lengthReport"]

            def make_date(row):
                try:
                    y = int(row["year"])
                    q = int(row["quarter"])
                    if q == 1:
                        return f"{y}-03-31"
                    if q == 2:
                        return f"{y}-06-30"
                    if q == 3:
                        return f"{y}-09-30"
                    if q == 4:
                        return f"{y}-12-31"
                except Exception as e:
                    logging.error(f"Error making date for {symbol}: {e}", exc_info=True)
                    pass
                return None

            df_final["fiscal_date"] = df_final.apply(make_date, axis=1)

        df_final.dropna(subset=["year", "quarter", "fiscal_date"], inplace=True)

        # Ensure columns exist and fill with 0 BEFORE type conversion
        for col in required_metrics:
            if col not in df_final.columns:
                df_final[col] = 0.0

        # Clean Decimal Columns
        df_final = clean_decimal_cols(df_final, required_metrics)

        # Select Final Columns
        final_cols = ["ticker", "fiscal_date", "year", "quarter"] + required_metrics
        return df_final[final_cols]

    except Exception as e:
        logging.error(f"Error fetching income stmt for {symbol}: {e}", exc_info=True)
        return pd.DataFrame()


def fetch_dividends(symbol):
    try:
        company = Company(symbol=symbol, source="TCBS")
        df = company.dividends()
        if df is None or df.empty:
            return pd.DataFrame()

        df["ticker"] = symbol
        if "exercise_date" in df.columns:
            df["exercise_date"] = pd.to_datetime(df["exercise_date"]).dt.date

        required_cols = [
            "ticker",
            "exercise_date",
            "cash_year",
            "cash_dividend_percentage",
            "stock_dividend_percentage",
            "issue_method",
        ]
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0 if "percentage" in col or "year" in col else None

        df = clean_decimal_cols(
            df, ["cash_dividend_percentage", "stock_dividend_percentage"]
        )
        return df[required_cols]
    except Exception as e:
        logging.error(f"Error fetching dividends for {symbol}: {e}", exc_info=True)
        return pd.DataFrame()


def fetch_news(symbol):
    try:
        company = Company(symbol=symbol, source="TCBS")
        df = company.news(page_size=50)
        if df is None or df.empty:
            return pd.DataFrame()

        df["ticker"] = symbol
        df.rename(columns={"id": "news_id", "price": "price_at_publish"}, inplace=True)
        if "publish_date" in df.columns:
            df["publish_date"] = pd.to_datetime(df["publish_date"])

        required_cols = [
            "ticker",
            "publish_date",
            "title",
            "source",
            "price_at_publish",
            "price_change",
            "price_change_ratio",
            "rsi",
            "rs",
            "news_id",
        ]
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0 if "price" in col or "rs" in col else None

        df = clean_decimal_cols(
            df, ["price_at_publish", "price_change", "price_change_ratio", "rsi", "rs"]
        )
        return df[required_cols]
    except Exception as e:
        logging.error(f"Error fetching news for {symbol}: {e}", exc_info=True)
        return pd.DataFrame()
