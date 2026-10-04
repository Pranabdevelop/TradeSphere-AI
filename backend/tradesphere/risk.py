"""Risk & portfolio analytics: VaR / CVaR, Monte-Carlo bootstrap, Markowitz efficient frontier."""
import numpy as np
import pandas as pd


def var_cvar(returns: pd.Series, level: float = 0.95) -> tuple:
    """Historical Value-at-Risk and Expected Shortfall, as positive loss fractions."""
    r = returns.dropna().values
    var = -np.percentile(r, (1 - level) * 100)
    tail = r[r <= -var]
    return float(var), float(-tail.mean()) if len(tail) else float(var)


def monte_carlo(returns: pd.Series, horizon: int = 252, n_paths: int = 2000, seed: int = 0) -> np.ndarray:
    """Bootstrap daily returns -> (n_paths x horizon) wealth paths starting at 1.0."""
    rng = np.random.default_rng(seed)
    r = returns.dropna().values
    return np.cumprod(1 + r[rng.integers(0, len(r), (n_paths, horizon))], axis=1)


def mc_summary(paths: np.ndarray) -> dict:
    end = paths[:, -1]
    return {"Median outcome": float(np.median(end)), "5th percentile": float(np.percentile(end, 5)),
            "95th percentile": float(np.percentile(end, 95)), "P(loss)": float((end < 1).mean())}


def efficient_frontier(prices: pd.DataFrame, n: int = 4000, rf: float = 0.0, seed: int = 0):
    """Random-portfolio efficient frontier. Returns (cloud DataFrame, best-Sharpe weights, min-vol weights)."""
    rets = prices.pct_change().dropna()
    mu, cov = rets.mean().values * 252, rets.cov().values * 252
    W = np.random.default_rng(seed).dirichlet(np.ones(prices.shape[1]), n)
    port_ret = W @ mu
    port_vol = np.sqrt(np.einsum("ij,jk,ik->i", W, cov, W))
    cloud = pd.DataFrame({"Return": port_ret, "Volatility": port_vol, "Sharpe": (port_ret - rf) / port_vol})
    best = pd.Series(W[cloud["Sharpe"].idxmax()], index=prices.columns)
    safe = pd.Series(W[cloud["Volatility"].idxmin()], index=prices.columns)
    return cloud, best, safe
