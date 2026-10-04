"""Technical-indicator feature engineering (all features use only past/current data)."""
import numpy as np
import pandas as pd


def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return (100 - 100 / (1 + up / dn.replace(0, np.nan))).fillna(50)


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    c, h, l, v = df["Close"], df["High"], df["Low"], df["Volume"].astype(float)
    r = c.pct_change()
    f = pd.DataFrame(index=df.index)
    for k in (1, 5, 10, 20):
        f[f"ret_{k}"] = c.pct_change(k)
    f["vol_10"], f["vol_20"] = r.rolling(10).std(), r.rolling(20).std()
    f["rsi"] = rsi(c)

    macd = c.ewm(span=12, adjust=False).mean() - c.ewm(span=26, adjust=False).mean()
    f["macd"] = macd / c
    f["macd_hist"] = (macd - macd.ewm(span=9, adjust=False).mean()) / c

    m, s = c.rolling(20).mean(), c.rolling(20).std()
    f["bb_pos"] = (c - (m - 2 * s)) / (4 * s)
    f["bb_width"] = 4 * s / m

    tr = pd.concat([h - l, (h - c.shift()).abs(), (l - c.shift()).abs()], axis=1).max(axis=1)
    f["atr_pct"] = tr.rolling(14).mean() / c
    f["sma20_gap"] = c / m - 1
    f["sma50_gap"] = c / c.rolling(50).mean() - 1
    f["vol_z"] = (v - v.rolling(20).mean()) / v.rolling(20).std()
    f["range_pct"] = (h - l) / c
    return f.replace([np.inf, -np.inf], np.nan)


def make_target(close: pd.Series, horizon: int = 5) -> pd.Series:
    """1 if the close `horizon` days ahead is higher than today's, else 0 (last rows NaN: unknown future)."""
    fwd = close.shift(-horizon) / close - 1
    return (fwd > 0).astype(float).where(fwd.notna())
