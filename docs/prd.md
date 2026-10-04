# PRD — TradeSphere AI

## 1. Summary
TradeSphere AI is a multimodal, multi-agent trading research lab for an AI/ML final-year minor
project. It fuses **numeric** market data, **textual** news sentiment, and **categorical** market-regime
signals to train, backtest, and fairly compare multiple ML and RL trading agents, then stress-tests the
winners and reports risk like a real quant tool would.

## 2. Problem statement
Most student trading projects report one backtest number and call it done. That number is usually
leaked (future data touched training), ignores transaction costs, and is never compared to a baseline.
Nobody can tell if the "AI" actually added value or just got lucky on one run.

## 3. Goals
- Build a leakage-free, walk-forward pipeline so results are trustworthy.
- Combine three data modalities (price/technical, text/news, regime/categorical) into trading decisions.
- Compare multiple models/agents fairly on identical cost assumptions and test windows.
- Quantify risk (VaR, CVaR, Monte-Carlo, drawdown), not just return.
- Make the whole thing explorable through an interactive UI, not just a script output.

## 4. Non-goals
- Not a production trading system; no real order execution or brokerage integration.
- Not investment advice; no guarantee of live-market profitability.
- Not optimized for high-frequency or intraday data (daily bars only).

## 5. Target users
- Evaluators/examiners assessing an AI/ML minor project.
- Students/developers who want a template for rigorous strategy evaluation.
- Curious retail users exploring how ML/RL agents behave on a stock they know.

## 6. The three modalities
| Modality | Data | Where it's used |
|---|---|---|
| Numeric | OHLCV prices, 16 technical indicators (RSI, MACD, Bollinger, ATR, volatility...) | ML forecaster, RL state, backtester |
| Textual | News headlines, lexicon-based sentiment score | Sentiment Lab, exposure tilt on ML agent |
| Categorical | Bull/Sideways/Bear regime label (Gaussian Mixture Model) | Regime Switcher agent, Council ensemble |

Future extension: a fourth, **visual** modality (candlestick chart images read by a CNN/vision model)
is listed in `architecture.md` as a stretch goal — this would make the system fully four-modality.

## 7. Key features
1. Walk-forward ML forecaster (Random Forest / Gradient Boosting / Logistic Regression).
2. Regime detection (GMM) feeding a dedicated agent.
3. Reinforcement learning agent (tabular Q-learning, walk-forward retraining).
4. Agent Arena: 7 agents + ensemble "Council" scored on identical out-of-sample data and costs.
5. Stress-test lab: flash crash / bear phase / melt-up / volatility storm scenarios.
6. Risk lab: VaR, CVaR, Monte-Carlo fan chart.
7. Portfolio lab: correlation heatmap, efficient frontier.
8. Sentiment lab: headline scoring with negation handling, exposure tilt.
9. Streamlit dashboard (7 tabs) + a separate Next.js marketing/UI shell.

## 8. Success metrics
- Zero look-ahead leakage, proven by automated tests (`backend/test_pipeline.py`).
- At least one agent beats Buy & Hold on risk-adjusted return (Sharpe) OR on drawdown, on at least
  one real ticker — reported honestly either way.
- Dashboard runs end-to-end on a fresh machine in under 5 minutes from `pip install`.
- Report/viva can clearly explain every number shown (no black-box metrics).

## 9. Risks & constraints
- Public market data has very low signal-to-noise; AUC near 0.50 is expected and acceptable.
- Yahoo Finance can rate-limit or go offline — the synthetic-market fallback mitigates this.
- Tabular Q-learning doesn't scale past a handful of discrete states; documented as a known limitation.

## 10. Milestones
1. Data + feature pipeline — done.
2. ML forecaster + walk-forward validation — done.
3. RL agent + regime detection — done.
4. Agent Arena + backtester + risk/portfolio/sentiment labs — done.
5. Streamlit dashboard — done.
6. Frontend UI shell (Next.js) — done.
7. Final report, stress-test write-up, viva prep — in progress.
