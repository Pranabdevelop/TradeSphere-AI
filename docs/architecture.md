# Architecture — TradeSphere AI

## 1. High-level diagram
```
                     ┌─────────────────────────────┐
                     │   Modality 1: NUMERIC        │
                     │   Yahoo Finance / synthetic  │
                     │   OHLCV → 16 indicators      │
                     └───────────────┬───────────────┘
                                     │
┌───────────────────┐   ┌───────────▼────────────┐   ┌──────────────────────┐
│ Modality 2: TEXT   │   │     FEATURE LAYER       │   │ Modality 3: CATEGORY │
│ News headlines      │   │ features.py             │   │ GMM regime detector   │
│ sentiment.py         │   └───────────┬────────────┘   │ models.py (regimes)   │
└──────────┬──────────┘               │                 └───────────┬───────────┘
           │                          ▼                              │
           │              ┌───────────────────────┐                  │
           │              │     MODEL LAYER         │                  │
           │              │ walk-forward ML         │◄─────────────────┘
           │              │ (RF / GB / LogReg)       │
           │              │ RL Q-learner             │
           │              └───────────┬───────────────┘
           │                          │ target exposure 0..1 per agent
           ▼                          ▼
   ┌─────────────────────────────────────────────┐
   │                AGENT LAYER                    │
   │ BuyHold · Momentum · MeanReversion · ML        │
   │ · RegimeSwitcher · QLearner · Council (fusion)  │
   │                 agents.py / arena.py            │
   └───────────────────────┬───────────────────────┘
                            ▼
                ┌───────────────────────┐
                │   BACKTEST ENGINE       │
                │ costs, equity, metrics  │
                │   backtest.py           │
                └───────────┬─────────────┘
                            ▼
      ┌─────────────────────────────────────────────┐
      │        ANALYTICS: risk.py, scenarios          │
      │  VaR/CVaR · Monte-Carlo · efficient frontier   │
      │  flash-crash / bear / rally / vol-storm shocks  │
      └───────────────────────┬─────────────────────┘
                              ▼
            ┌───────────────────────────────────┐
            │   PRESENTATION                      │
            │ app.py (Streamlit, 7 tabs)           │
            │ frontend/ (Next.js shell)             │
            └───────────────────────────────────┘
```

## 2. Multimodal fusion point
Fusion happens at the **agent layer**, not by concatenating raw modalities into one feature vector.
Each modality drives a distinct signal, and the **Council** agent fuses them by averaging exposures:

- Numeric → `MLForecaster` (probability of a price rise) and the RL agent's state.
- Categorical → `RegimeSwitcher` (discrete Bull/Sideways/Bear exposure rule).
- Textual → `sentiment_tilt()` nudges `MLForecaster`'s exposure up or down in the Sentiment Lab.

This late-fusion design is deliberate: it keeps each modality's contribution interpretable and
auditable (you can always say *why* an agent took a position), which matters for a viva.

## 3. Module responsibilities
| Module | Responsibility |
|---|---|
| `data.py` | Fetch real prices (yfinance) or generate a regime-switching synthetic market. |
| `features.py` | Compute 16 technical indicators; build the forward-looking label with a leakage guard. |
| `models.py` | Walk-forward ML training/eval, GMM regime detection, feature importance. |
| `agents.py` | All trading agents, including the tabular Q-learning RL agent. |
| `backtest.py` | Turn agent exposures into cost-adjusted returns and performance metrics. |
| `arena.py` | Orchestrates agents + Council on a shared split; applies stress scenarios. |
| `risk.py` | VaR/CVaR, Monte-Carlo bootstrap, Markowitz efficient frontier. |
| `sentiment.py` | Lexicon-based headline scoring with negation handling. |
| `app.py` | Streamlit dashboard (7 tabs) consuming all of the above. |
| `frontend/` | Standalone Next.js presentation shell (not yet wired to a live API). |

## 4. Data flow contract (no look-ahead)
1. `features.py` computes indicators using only `t` and earlier.
2. `make_target(close, horizon)` labels row `i` using the price at `i + horizon`; the last `horizon`
   rows are unlabeled (`NaN`) because the future isn't known yet.
3. `walk_forward_proba()` trains only on rows whose label is already resolvable at time `t`
   (`t - horizon + 1` rows), then predicts forward until the next retrain point.
4. `QLearner` trains only on data before `test_start`, then continues training **walk-forward** using
   only data strictly before the current simulated day.
5. `backend/test_pipeline.py::test_agents_have_no_lookahead` asserts that deleting future rows never
   changes a past decision — this is the architectural invariant the whole system is built to satisfy.

## 5. Tech stack
- **Core:** Python 3.12, pandas, NumPy, scikit-learn, SciPy.
- **Dashboard:** Streamlit, Plotly.
- **Frontend shell:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Testing:** pytest-style assertions (`backend/test_pipeline.py`).
- **Data source:** Yahoo Finance via `yfinance`, with a synthetic fallback.

## 6. Deployment notes
- Dashboard: run `python -m streamlit run app.py` from `backend/`, or Streamlit Community Cloud for a public link.
- Frontend shell: run `npm run build && npm start` from `frontend/`, or deploy to Vercel.
- The two are currently **not connected**; wiring them would mean wrapping `arena.py` in a small
  FastAPI service and having the Next.js app fetch from it (see `memory.md` for status).

## 7. Known limitations
- Single-asset, long-only; no slippage/liquidity modeling.
- RL state space is intentionally small (18 states) for explainability, not performance.
- Sentiment is lexicon-based, not a trained NLP model (documented as a future upgrade).
