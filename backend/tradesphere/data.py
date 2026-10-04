"""Data layer.

Real prices come from Yahoo Finance (yfinance). If the download fails (offline lab PC,
bad ticker, rate limit) we fall back to a regime-switching synthetic market so the
whole project still runs end-to-end.
"""
import zlib

import numpy as np
import pandas as pd

OHLCV = ["Open", "High", "Low", "Close", "Volume"]


def synthetic_prices(days: int = 1260, seed: int = 42, s0: float = 100.0) -> pd.DataFrame:
    """Markov regime-switching market: bull / bear / sideways, plus a shared market factor."""
    rng = np.random.default_rng(seed)
    mu = np.array([0.0008, -0.0007, 0.0001])       # daily drift per regime
    sigma = np.array([0.008, 0.022, 0.011])        # daily volatility per regime
    P = np.array([[0.985, 0.005, 0.010],
                  [0.020, 0.960, 0.020],
                  [0.020, 0.010, 0.970]])
    state, rets = 2, np.empty(days)
    for t in range(days):
        state = rng.choice(3, p=P[state])
        rets[t] = rng.normal(mu[state], sigma[state])
    common = np.random.default_rng(12345).normal(0, 0.01, days)   # shared across tickers
    rets = np.clip(0.8 * rets + 0.2 * common, -0.5, 0.5)

    close = s0 * np.cumprod(1 + rets)
    open_ = np.r_[s0, close[:-1]] * (1 + rng.normal(0, 0.002, days))
    high = np.maximum(open_, close) * (1 + np.abs(rng.normal(0, 0.004, days)))
    low = np.minimum(open_, close) * (1 - np.abs(rng.normal(0, 0.004, days)))
    volume = (rng.lognormal(14, 0.3, days) * (1 + 30 * np.abs(rets))).astype(np.int64)
    last_bday = pd.offsets.BDay().rollback(pd.Timestamp.today().normalize())
    idx = pd.date_range(end=last_bday, periods=days, freq="B")
    return pd.DataFrame({"Open": open_, "High": high, "Low": low, "Close": close, "Volume": volume}, index=idx)


def load_prices(ticker: str, years: int = 5, force_synthetic: bool = False):
    """Return (DataFrame[OHLCV], source_label). Any Yahoo ticker works, e.g. RELIANCE.NS, AAPL, ^NSEI."""
    if not force_synthetic:
        try:
            import yfinance as yf

            df = yf.download(ticker, period=f"{years}y", auto_adjust=True, progress=False)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            df = df[OHLCV].dropna()
            if len(df) >= 400:
                return df, f"Yahoo Finance ({ticker})"
        except Exception:
            pass
    seed = zlib.crc32(ticker.encode()) % 10_000
    return synthetic_prices(days=years * 252, seed=seed), f"Synthetic market (seed from '{ticker}')"
