"""Headless demo (no browser needed):  python run_demo.py --ticker RELIANCE.NS
Add --synthetic to run fully offline."""
import argparse
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from tradesphere.arena import run_arena
from tradesphere.data import load_prices
from tradesphere.models import MODELS, regime_stats
from tradesphere.risk import var_cvar

ap = argparse.ArgumentParser(description="TradeSphere AI command-line demo")
ap.add_argument("--ticker", default="RELIANCE.NS")
ap.add_argument("--years", type=int, default=5)
ap.add_argument("--model", default="Random Forest", choices=list(MODELS))
ap.add_argument("--horizon", type=int, default=5)
ap.add_argument("--cost-bps", type=float, default=10.0)
ap.add_argument("--synthetic", action="store_true")
ap.add_argument("--out", default="results")
a = ap.parse_args()

df, source = load_prices(a.ticker, a.years, a.synthetic)
print(f"Data: {source}, {len(df)} bars")
res = run_arena(df, a.model, cost_bps=a.cost_bps, horizon=a.horizon)

pd.set_option("display.width", 220, "display.max_columns", 20)
print("\n== ML forecast (out-of-sample) ==")
print(res.ml_eval, f"| latest P(up in {a.horizon}d) = {res.next_day_proba:.1%}")
print("\n== Regimes ==\n", regime_stats(res.close, res.regimes))
print("\n== Leaderboard (sorted by Sharpe) ==\n", res.metrics)
v, cv = var_cvar(res.results["Council (Ensemble)"]["returns"].iloc[1:])
print(f"\nCouncil 1-day VaR(95%) = {v:.2%}, CVaR(95%) = {cv:.2%}")

os.makedirs(a.out, exist_ok=True)
fig, ax = plt.subplots(2, 1, figsize=(10, 7), sharex=True)
for name, r in res.results.items():
    eq = r["equity"] / r["equity"].iloc[0] * 100
    ax[0].plot(eq, label=name, ls="--" if name == "Buy & Hold" else "-", lw=1.4)
    ax[1].plot((eq / eq.cummax() - 1) * 100, lw=1)
ax[0].set_title(f"TradeSphere AI: out-of-sample equity curves ({a.ticker})")
ax[0].legend(fontsize=8)
ax[1].set_title("Drawdown (%)")
plt.tight_layout()
path = os.path.join(a.out, "equity_curves.png")
fig.savefig(path, dpi=130)
res.metrics.to_csv(os.path.join(a.out, "leaderboard.csv"))
print(f"\nSaved {path} and leaderboard.csv")
