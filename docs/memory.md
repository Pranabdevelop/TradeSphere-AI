# Memory — TradeSphere AI

Running log of decisions, context, and known state. Read this first before picking up the project again
(for a human returning to it, or an AI assistant resuming work).

## Current status (as of last session)
- Core pipeline (`backend/tradesphere/`), Streamlit dashboard (`backend/app.py`), and CLI demo
  (`backend/run_demo.py`) are in place. The pipeline tests are in `backend/test_pipeline.py`.
- Project was originally scaffolded under the name **AlphaArena**, then renamed to **TradeSphere AI**
  (package `alphaarena/` → `tradesphere/`, all display strings and the README updated).
- A separate Next.js UI shell (`frontend/`) was built as a presentation layer with a Pinterest/
  Gen-Z-coded design system (warm palette, neo-brutalist cards, trading-themed micro-animations).
  **It is not wired to the Python backend** — it shows sample numbers only.
- These five planning docs (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `memory.md`) were
  added to formalize scope, structure, invariants, visual language, and history.

## Decisions log
| Decision | Reasoning |
|---|---|
| Walk-forward validation instead of random train/test split | Time series leak future info otherwise |
| Forecast horizon defaulted to 5 days, not 1 | 1-day-ahead signal was too noisy/over-traded; 5-day gave the ML agent a usable, less costly signal |
| ML Forecaster EMA-smooths its probability and rounds exposure to quarter-steps | Raw probability flip-flopped daily, racking up transaction costs on noise |
| RL agent retrains walk-forward every `retrain_every` days instead of once | Original version trained once on the pre-test window and then sat flat/idle for much of the test window |
| RL state space kept small (18 states: RSI × trend × vol buckets) | Explainability for a viva matters more than squeezing out extra performance |
| Regime detector (GMM) fit only on an early window, applied forward | Keeps it consistent with the no-look-ahead rule |
| Synthetic market fallback (regime-switching, seeded by ticker) | Lab PCs may be offline or Yahoo Finance may rate-limit; project must still run end-to-end |
| Sentiment is lexicon-based, not FinBERT | Keeps the project dependency-light and fully offline; listed as a clear upgrade path |
| Fusion of modalities happens at the agent layer (late fusion), not as one concatenated feature vector | Keeps each modality's contribution interpretable for the report/viva |

## Known issues / open threads
- Next.js dependencies are installed under `frontend/`, and `npm run build` there succeeds.
- The pipeline tests have not run in the current machine environment: its Application Control policy
  blocks SciPy's native DLLs during import.
- Backtest results vary meaningfully across synthetic-market random seeds (see multi-seed test run:
  Sharpe for the same agent ranged roughly 0 to 2.6 depending on seed). This is expected and is called
  out honestly in `README.md` section 8 — don't "fix" this by cherry-picking a seed.
- Dashboard and UI shell are not yet connected. If connecting them: wrap `arena.py` in a FastAPI service
  returning JSON (leaderboard, equity curves, latest exposures), then have the Next.js app fetch it.
- `Project Type` field on the submission form was ambiguous (no option list was visible) — answered as
  "Application" in the submitted abstract; confirm against the actual form options.

## Things tried and reverted
- Original `make_target`/`walk_forward_proba` used a 1-day horizon with no horizon parameter — reverted
  in favor of a configurable `horizon` (default 5) because 1-day labels were too noisy and let the ML
  agent over-trade (158–253 trades per run in early tests).
- Original RL agent trained once on the pre-test window only — reverted to walk-forward retraining
  after seeing 0% exposure for several seeds in testing.

## Useful context for the next session
- Multi-seed robustness check script (inline, not saved as a file) lives in the conversation history:
  loops seeds `[7, 11, 21, 33, 58]` through `run_arena()` and prints Sharpe/AUC/trade counts per agent —
  worth re-running after any model or agent change.
- Test command: `python -m pytest -q` from `backend/` (or manually call each `test_*` function if
  `pytest` isn't installed in the environment).
- CLI demo: `python run_demo.py --ticker TCS.NS` from `backend/` (add `--synthetic` to run offline).
