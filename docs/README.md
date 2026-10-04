# 🌐 TradeSphere AI — A Multi-Agent Machine-Learning & Reinforcement-Learning Trading Lab

> AI/ML final-year minor project. Train competing AI trading agents on real market data, score them on
> the same out-of-sample period, stress-test them with market shocks, and analyse their risk, all from
> one interactive dashboard.


---

## 1. Problem statement

Retail investors and students often judge a trading idea by looking at one lucky backtest. Real
evaluation needs (a) no look-ahead bias, (b) transaction costs, (c) fair comparison against simple
baselines, and (d) an idea of how the strategy behaves in a crash. TradeSphere AI builds this
evaluation pipeline and puts several AI/ML strategies through it.

## 2. What makes this different from LLM-based simulators (e.g. StockAgent)

| | LLM simulator (StockAgent-style) | **TradeSphere AI** |
|---|---|---|
| Market | Simulated, agents are prompted LLMs | **Real historical data** (Yahoo Finance) or built-in synthetic market |
| Intelligence | Prompt-driven LLM agents (needs paid API keys) | **Trained** ML models + **Reinforcement Learning** (runs free, offline) |
| Goal | Study how external factors change trading behaviour | **Compare strategies fairly**, quantify risk, stress-test |
| Evaluation | Behavioural analysis | Walk-forward validation, costs, Sharpe/Sortino/Drawdown, VaR, Monte-Carlo |
| Extras | — | Regime detection, ensemble "Council", portfolio optimiser, sentiment tilt |

The code is written from scratch; nothing is copied from that repository.

## 3. Features

1. **Data layer:** any Yahoo ticker (`RELIANCE.NS`, `^NSEI`, `AAPL`…), with an automatic offline synthetic-market fallback.
2. **Feature engineering:** 16 technical indicators (returns, volatility, RSI, MACD, Bollinger, ATR, SMA gaps, volume z-score…).
3. **ML forecaster:** Random Forest / Gradient Boosting / Logistic Regression predicting "will price be higher in *h* days?" with **walk-forward validation** and a label-leakage guard.
4. **Market-regime detection:** Gaussian Mixture Model classifies days as Bull / Sideways / Bear.
5. **Reinforcement-learning agent:** tabular **Q-learning** (18 market states × position × {flat, long}) that is re-trained walk-forward.
6. **Agent Arena:** 7 agents compete on the same out-of-sample window:
   Buy & Hold, Momentum (SMA cross), Mean Reversion (RSI), ML Forecaster, Regime Switcher, RL Q-Learner and a **Council** (ensemble that averages four agents).
7. **Realistic backtester:** transaction costs, position sizing, optional **volatility-targeting risk overlay**.
8. **Stress-test lab:** inject a Flash crash / Rate-hike bear phase / Melt-up / Volatility storm and compare agents before vs. after.
9. **Risk lab:** historical VaR & CVaR (95/99 %), bootstrap Monte-Carlo fan chart, probability of loss.
10. **Portfolio lab:** correlation heat-map and Markowitz efficient frontier (max-Sharpe and min-volatility weights).
11. **Sentiment lab:** lexicon-based headline scoring with negation handling; tilts the ML agent's exposure.
12. **Explainability:** feature-importance chart, RL learning curve, per-agent exposure plot.

## 4. Architecture

```
Yahoo Finance / synthetic data
          │
          ▼
   features.py (16 indicators) ──► models.py ──► walk-forward P(up)  ─┐
          │                         └────────► GMM regime detector ──┤
          │                                                          ▼
          └───────────────► agents.py: BuyHold · Momentum · MeanReversion · MLForecaster
                                       · RegimeSwitcher · QLearner (RL)
                                                   │  target exposure 0..1
                                                   ▼
                     arena.py ── Council (ensemble) ─► backtest.py (costs, metrics)
                                                   │
                     scenarios.py (shocks)         ▼
                     risk.py · sentiment.py ─► app.py (Streamlit dashboard, 7 tabs)
```

## 5. Folder structure

```
TradeSphereAI/
├── backend/
│   ├── app.py                 # Streamlit dashboard
│   ├── run_demo.py            # command-line demo (saves chart + CSV)
│   ├── test_pipeline.py       # unit tests incl. look-ahead checks
│   ├── requirements.txt
│   └── tradesphere/
│       ├── __init__.py
│       ├── data.py            # yfinance + synthetic market
│       ├── features.py        # indicators, target
│       ├── models.py          # walk-forward ML, evaluation, regimes
│       ├── agents.py          # all trading agents incl. Q-learning
│       ├── backtest.py        # engine + performance metrics
│       ├── arena.py           # orchestrates agents, council, stress scenarios
│       ├── risk.py            # VaR/CVaR, Monte-Carlo, efficient frontier
│       └── sentiment.py       # headline sentiment
├── frontend/
│   ├── src/app/               # Next.js App Router pages and global styles
│   ├── src/components/        # reusable React components
│   └── package.json
└── docs/                      # architecture, design, PRD, rules, and project notes
```

## 6. Setup & run

Create and install the Python environment from the project root:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

In a PowerShell terminal, start the backend:

```powershell
Set-Location backend
python -m streamlit run app.py
```

In a second terminal, start the frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:3000` and the Streamlit dashboard at the URL printed by
Streamlit (usually `http://localhost:8501`). The frontend is currently a static UI shell and does not
call the Python backend. To run backend tests or the headless demo, run these from `backend/`:

```powershell
python -m pytest -q
python run_demo.py --ticker TCS.NS
```

For Bash, replace the environment setup with `python3 -m venv backend/.venv`,
`source backend/.venv/bin/activate`, and `python -m pip install -r backend/requirements.txt`.
No API keys are required.

## 7. Methodology (what to explain in your report / viva)

**Walk-forward validation.** A random train/test split leaks the future in time-series. Here the model is
re-trained every 40 days on an expanding window and predicts only the *next* block. The label of row *i*
uses the price at *i + h*, so rows are only used for training once that label is actually known
(`walk_forward_proba` in `models.py`).

**Fair comparison.** Every agent starts in cash, pays the same transaction cost, and is scored only on the
final 40 % of history. The RL agent and ML model see only data before each decision.

**Q-learning update.**
`Q(s,p,a) ← Q(s,p,a) + α [ r + γ · max_a' Q(s',a,a') − Q(s,p,a) ]`,
where the state is (RSI bucket, trend bucket, volatility bucket) and current position *p*, the action is
"flat / long", and the reward is `100 · (a · next_return − |a − p| · cost)`.
Exploration follows an ε-greedy schedule that decays with the episode count.

**Regime detection.** A 3-component Gaussian Mixture on (20-day mean return, 20-day volatility).
Clusters are named by their mean return, and the model is fitted on the first part of the data only.

**Metrics.** Total return, CAGR, annual volatility, Sharpe, Sortino, maximum drawdown, Calmar, win rate,
exposure, trade count; risk: historical VaR / CVaR and bootstrap Monte-Carlo.

**Tests.** `backend/test_pipeline.py` proves that features, ML signals, regimes and the RL agent give identical
decisions on past days even when future data is deleted (no look-ahead).

## 8. Honest results & limitations (write this in your report — examiners like it)

* Predicting price direction is extremely hard. Expect ROC-AUC ≈ 0.50–0.58; **an ML agent will often
  fail to beat Buy & Hold**, especially after costs. The value of the project is the *rigorous evaluation*,
  and agents often win on **risk** (lower drawdown / volatility) rather than raw return.
* On the built-in synthetic market, results vary a lot between random seeds; this is expected.
* The RL state space is deliberately small (18 states) so it is explainable and trains in seconds.
* Long-only, single-asset trading; no slippage or liquidity model; daily bars only.
* The regime and sentiment components are simple and are meant to be extended (see below).
* This is an **educational project, not investment advice**.

## 9. Ideas to extend (for extra marks)

* Replace Q-table with a **DQN / PPO** agent (`torch` or `stable-baselines3`).
* Add an **LSTM / Transformer** forecaster and compare it with the tree models.
* Replace the sentiment lexicon with **FinBERT** and pull real news via NewsAPI / RSS.
* Multi-asset RL agent that outputs portfolio weights (use the efficient-frontier module as a baseline).
* Add short-selling, stop-loss / take-profit, and slippage models.
* Deploy on Streamlit Community Cloud.

## 10. Likely viva questions

1. *Why walk-forward instead of `train_test_split`?* → Prevents look-ahead bias in time series.
2. *Why is accuracy alone misleading?* → Class imbalance; compare to the majority baseline; also use AUC.
3. *Why did your ML agent lose to Buy & Hold?* → Weak signal + transaction costs; see Section 8.
4. *Explain the Q-learning update and the role of α, γ and ε.*
5. *What is Sharpe vs. Sortino vs. maximum drawdown?*
6. *What is VaR/CVaR and how did you compute it?* → Historical percentile of daily returns / mean of the tail.
7. *Why did you include a volatility-targeting overlay?* → Reduces exposure when risk rises.
8. *How would you scale this to many stocks?* → Portfolio-level RL, batch data pipeline, database.

## 11. Suggested report outline

Abstract → Introduction → Literature survey (LLM trading agents, RL for trading, walk-forward testing) →
Problem statement → System design (Section 4) → Implementation (Section 7) → Results (leaderboard,
equity curves, stress test, risk) → Limitations → Conclusion & future work → References.

---
*Disclaimer: for education and research only. Nothing here is financial advice.*
