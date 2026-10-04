"""Arena: trains every agent on the same data and scores them on the same out-of-sample window."""
from dataclasses import dataclass

import numpy as np
import pandas as pd

from .agents import (BuyHold, Context, MeanReversion, MLForecaster, Momentum, QLearner,
                     RegimeSwitcher, vol_overlay)
from .backtest import run_backtest
from .features import add_features, make_target
from .models import MODELS, detect_regimes, evaluate, fit_latest, walk_forward_proba

COUNCIL = "Council (Ensemble)"
COUNCIL_MEMBERS = ["Momentum (SMA 20/50)", "ML Forecaster", "Regime Switcher", "RL Q-Learner"]


@dataclass
class ArenaResult:
    close: pd.Series
    test_start: int
    results: dict            # agent -> {equity, returns, weights, metrics}
    metrics: pd.DataFrame    # leaderboard
    proba: pd.Series
    regimes: pd.Series
    feats: pd.DataFrame
    ml_eval: dict
    importance: pd.Series
    next_day_proba: float
    latest_weights: dict
    rl_rewards: list


def split_index(n: int, train_frac: float) -> int:
    return int(n * train_frac)


def run_arena(df: pd.DataFrame, model_name: str = "Random Forest", train_frac: float = 0.6,
              cost_bps: float = 10.0, rl_episodes: int = 60, vol_target=None, seed: int = 0,
              horizon: int = 5) -> ArenaResult:
    n = len(df)
    if n < 400:
        raise ValueError("Need at least 400 daily bars (about 2 years) to train and test the agents.")
    close, ts = df["Close"], split_index(n, train_frac)

    feats, y = add_features(df), make_target(close, horizon)
    proba = walk_forward_proba(feats, y, MODELS[model_name], start=150, step=40, horizon=horizon)
    regimes = detect_regimes(close, fit_n=min(250, ts - 25))
    ctx = Context(df, feats, proba, regimes, ts, cost_bps)

    rl = QLearner(episodes=rl_episodes, seed=seed)
    agents = [BuyHold(), Momentum(), MeanReversion(), MLForecaster(), RegimeSwitcher(), rl]
    W = {a.name: a.weights(ctx) for a in agents}
    W[COUNCIL] = pd.concat([W[k] for k in COUNCIL_MEMBERS], axis=1).mean(axis=1)
    if vol_target:
        W = {k: (v if k == "Buy & Hold" else vol_overlay(v, close, vol_target)) for k, v in W.items()}

    # score on the out-of-sample window only (one prior bar included so day-1 positions carry over)
    results = {k: run_backtest(close.iloc[ts - 1:], v.iloc[ts - 1:], cost_bps) for k, v in W.items()}
    metrics = pd.DataFrame({k: v["metrics"] for k, v in results.items()}).T.round(2)
    metrics = metrics.sort_values("Sharpe", ascending=False)

    p_next, importance = fit_latest(feats, y, MODELS[model_name])
    return ArenaResult(close, ts, results, metrics, proba, regimes, feats,
                       evaluate(proba.iloc[ts:], y.iloc[ts:]), importance, p_next,
                       {k: float(v.iloc[-1]) for k, v in W.items()}, rl.reward_history)


# ------------------------------------------------------------------ what-if scenarios
SCENARIOS = ["Flash crash", "Rate-hike bear phase", "Melt-up rally", "Volatility storm"]


def apply_scenario(df: pd.DataFrame, name: str, start: int, magnitude: float = 0.15,
                   length: int = 20, seed: int = 0) -> pd.DataFrame:
    """Inject a synthetic shock into the price history and rebuild consistent OHLC bars."""
    rng = np.random.default_rng(seed)
    r = df["Close"].pct_change().fillna(0).values.copy()
    e = min(start + length, len(r))
    if name == "Flash crash":
        r[start] -= magnitude
        r[start + 1:min(start + 6, len(r))] += magnitude * 0.4 / 5      # partial rebound
    elif name == "Rate-hike bear phase":
        r[start:e] += -magnitude / max(e - start, 1) + rng.normal(0, 0.006, e - start)
    elif name == "Melt-up rally":
        r[start:e] += magnitude / max(e - start, 1)
    elif name == "Volatility storm":
        r[start:e] += rng.normal(0, magnitude / 4, e - start)
    r = np.clip(r, -0.95, 1.0)
    new_close = df["Close"].iloc[0] * np.cumprod(1 + r)
    ratio = new_close / df["Close"].values
    out = df.copy()
    for col in ("Open", "High", "Low", "Close"):
        out[col] = out[col].values * ratio
    return out
