"""Trading agents. Each agent turns market context into a target exposure in [0, 1] for every day."""
from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class Context:
    df: pd.DataFrame          # OHLCV
    feats: pd.DataFrame       # technical features
    proba: pd.Series          # walk-forward P(up tomorrow) from the ML model
    regimes: pd.Series        # Bear / Sideways / Bull
    test_start: int           # first out-of-sample row (RL agent trains only before it)
    cost_bps: float = 10.0


class BuyHold:
    name = "Buy & Hold"

    def weights(self, ctx):
        return pd.Series(1.0, index=ctx.df.index)


class Momentum:
    name = "Momentum (SMA 20/50)"

    def weights(self, ctx):
        c = ctx.df["Close"]
        return (c.rolling(20).mean() > c.rolling(50).mean()).astype(float)


class MeanReversion:
    name = "Mean Reversion (RSI)"

    def __init__(self, buy_below=30, exit_above=55):
        self.buy_below, self.exit_above = buy_below, exit_above

    def weights(self, ctx):
        pos, out = 0.0, []
        for x in ctx.feats["rsi"].values:
            if x < self.buy_below:
                pos = 1.0
            elif x > self.exit_above:
                pos = 0.0
            out.append(pos)
        return pd.Series(out, index=ctx.df.index)


class MLForecaster:
    """Position size grows with the model's confidence that prices will be higher.

    The probability is EMA-smoothed and the position is rounded to quarter steps, which stops the
    agent from paying transaction costs on every tiny wiggle of the probability.
    """
    name = "ML Forecaster"

    def __init__(self, threshold=0.5, sizing=8.0, smooth=5):
        self.threshold, self.sizing, self.smooth = threshold, sizing, smooth

    def weights(self, ctx):
        p = ctx.proba.ewm(span=self.smooth, adjust=False, ignore_na=True).mean().where(ctx.proba.notna())
        w = ((p - self.threshold) * self.sizing).clip(0, 1).fillna(0.0)
        return (w * 4).round() / 4


class RegimeSwitcher:
    name = "Regime Switcher"
    EXPOSURE = {"Bull": 1.0, "Sideways": 0.5, "Bear": 0.0}

    def weights(self, ctx):
        return ctx.regimes.map(self.EXPOSURE).astype(float).fillna(0.5)


# ------------------------------------------------------------------ reinforcement learning
def market_state(feats: pd.DataFrame, vol_median: float) -> np.ndarray:
    """Discretise the market into 18 states: RSI(3) x trend(3) x volatility(2)."""
    rsi_b = np.digitize(feats["rsi"].fillna(50).values, [35, 65])
    trend_b = np.digitize(feats["sma20_gap"].fillna(0).values, [-0.01, 0.01])
    vol_b = (feats["vol_20"].fillna(vol_median).values > vol_median).astype(int)
    return rsi_b * 6 + trend_b * 2 + vol_b


class QLearner:
    """Tabular Q-learning. State = (market state, current position); action = go flat / go long.

    Reward = next-day P&L of the chosen position minus the transaction cost of switching.
    Walk-forward: the Q-table is first trained on data before `test_start`, then refreshed every
    `retrain_every` days using only data seen so far (warm start), and acts greedily in between.
    """
    name = "RL Q-Learner"
    FIRST = 50   # rows before this have unreliable indicators

    def __init__(self, episodes=60, alpha=0.1, gamma=0.95, seed=0, retrain_every=60):
        self.episodes, self.alpha, self.gamma = episodes, alpha, gamma
        self.seed, self.retrain_every = seed, retrain_every
        self.Q = np.zeros((18, 2, 2))                 # [market state, position, action]
        self.reward_history = []

    def _train(self, ms, ret, cost, end, episodes, eps0, rng):
        Q = self.Q
        for ep in range(episodes):
            eps, pos, total = max(0.05, eps0 * (1 - ep / episodes)), 0, 0.0
            for t in range(self.FIRST, end - 1):
                a = int(rng.integers(2)) if rng.random() < eps else int(np.argmax(Q[ms[t], pos]))
                r = 100 * (a * ret[t + 1] - abs(a - pos) * cost)
                Q[ms[t], pos, a] += self.alpha * (r + self.gamma * Q[ms[t + 1], a].max() - Q[ms[t], pos, a])
                pos, total = a, total + r
            self.reward_history.append(total)

    def weights(self, ctx):
        n = len(ctx.df)
        ret = ctx.df["Close"].pct_change().fillna(0).values
        vol_med = float(ctx.feats["vol_20"].iloc[:ctx.test_start].median())
        ms, cost = market_state(ctx.feats, vol_med), ctx.cost_bps / 1e4
        rng = np.random.default_rng(self.seed)
        self._train(ms, ret, cost, ctx.test_start, self.episodes, 0.5, rng)

        w, pos = np.zeros(n), 0
        for t in range(self.FIRST, n):
            if t >= ctx.test_start and (t - ctx.test_start) % self.retrain_every == 0 and t > ctx.test_start:
                self._train(ms, ret, cost, t, max(self.episodes // 3, 5), 0.15, rng)   # only data < t
            pos = int(np.argmax(self.Q[ms[t], pos]))
            w[t] = pos
        return pd.Series(w, index=ctx.df.index)


def vol_overlay(w: pd.Series, close: pd.Series, target: float = 0.15) -> pd.Series:
    """Risk overlay: shrink exposure when realised 20d volatility exceeds the annual target."""
    realised = close.pct_change().rolling(20).std() * np.sqrt(252)
    return w * (target / realised).clip(upper=1.0).fillna(1.0)
