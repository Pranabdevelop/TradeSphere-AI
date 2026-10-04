"""Vectorised long-only backtester with transaction costs and standard performance metrics."""
import numpy as np
import pandas as pd


def compute_metrics(r: pd.Series, w: pd.Series, rf: float = 0.0, periods: int = 252) -> dict:
    r = r.dropna()
    eq = (1 + r).cumprod()
    n = max(len(r), 1)
    sd = r.std()
    downside = np.sqrt((np.minimum(r, 0) ** 2).mean())
    mdd = (eq / eq.cummax() - 1).min()
    cagr = eq.iloc[-1] ** (periods / n) - 1
    invested = w.reindex(r.index).fillna(0) > 0
    return {
        "Total Return %": 100 * (eq.iloc[-1] - 1),
        "CAGR %": 100 * cagr,
        "Ann. Vol %": 100 * sd * np.sqrt(periods),
        "Sharpe": (r.mean() - rf / periods) / sd * np.sqrt(periods) if sd > 0 else 0.0,
        "Sortino": (r.mean() - rf / periods) / downside * np.sqrt(periods) if downside > 0 else 0.0,
        "Max DD %": 100 * mdd,
        "Calmar": cagr / abs(mdd) if mdd < 0 else float("nan"),
        "Win Rate %": 100 * (r[invested] > 0).mean() if invested.any() else 0.0,
        "Exposure %": 100 * w.reindex(r.index).fillna(0).mean(),
        "Trades": int((w.diff().abs() > 0.05).sum()),
    }


def run_backtest(close: pd.Series, weights: pd.Series, cost_bps: float = 10.0,
                 initial: float = 100_000.0, rf: float = 0.0) -> dict:
    """weights[t] = target exposure (0..1) decided at the close of day t, earned on day t+1.

    Every strategy starts in cash, so entering the first position is also charged.
    """
    ret = close.pct_change().fillna(0.0)
    w = weights.reindex(close.index).fillna(0.0).clip(0, 1).shift(1).fillna(0.0)
    turnover = w.diff().abs().fillna(w.abs())
    strat = w * ret - turnover * cost_bps / 1e4
    equity = initial * (1 + strat).cumprod()
    return {"equity": equity, "returns": strat, "weights": w,
            "metrics": compute_metrics(strat.iloc[1:], w.iloc[1:], rf)}
