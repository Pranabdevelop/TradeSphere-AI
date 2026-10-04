# Rules — TradeSphere AI

Project rules for anyone (human or AI assistant) working on this codebase. These are invariants the
project must never violate, not style preferences.

## 1. No look-ahead, ever
- A feature at row `t` may only use data from row `t` or earlier.
- A label at row `t` may only become usable for training once its underlying future price (`t + horizon`)
  has actually occurred.
- Any new agent or model must be checked against `backend/test_pipeline.py::test_agents_have_no_lookahead`
  — if a change breaks that test, the change is wrong, not the test.
- Never backfill a signal using `.fillna(method="bfill")` or similar on time-ordered market data.

## 2. Every agent is scored the same way
- Same ticker, same date range, same `test_start` split, same `cost_bps`.
- Every agent starts in cash and pays the entry cost like everyone else.
- No agent-specific backtest tweaks (e.g. a custom cost or a longer warm-up) without updating this rule
  and explaining why in `memory.md`.

## 3. Report risk honestly
- Never present only total return. Always show Sharpe/Sortino, Max Drawdown, and exposure together.
- If an agent loses to Buy & Hold, say so in the report — don't cherry-pick the one seed/ticker that wins.
- Any claim of "the model predicts the market" must be backed by out-of-sample AUC/accuracy vs. the
  majority-class baseline, not training-set numbers.

## 4. Data & modality rules
- Real data comes only from `yfinance`; never scrape or hardcode prices.
- If Yahoo Finance fails, fall back to `synthetic_prices()` — never silently return an empty frame.
- Text (news) and categorical (regime) modalities must stay separable and inspectable; don't collapse
  them into a single opaque feature vector without a way to show each modality's individual effect.

## 5. Code style
- Python: type-annotate function signatures where practical; keep functions under ~40 lines; prefer
  vectorised pandas/NumPy over row-by-row loops except where state (like the RL agent) requires a loop.
- No bare `except:`; catch specific exceptions, especially around network calls (`yfinance`).
- Every new module gets at least one test in `backend/test_pipeline.py`.
- Frontend: Tailwind utility classes only, no inline style objects except for dynamic values
  (e.g. bar height) that Tailwind can't express.

## 6. Git / workflow
- Commit messages describe *why*, not just *what* (e.g. "fix RL agent sitting idle: retrain walk-forward"
  not "update agents.py").
- Don't commit `node_modules/`, `__pycache__/`, or generated `results/` output.
- Any change to the look-ahead guard logic requires re-running the full test suite before merging.

## 7. Ethical / disclaimer rules
- Every user-facing surface (dashboard sidebar, README, reports) must carry the "educational project,
  not investment advice" disclaimer.
- Never present a backtest as a guarantee of future performance.
- Synthetic-market results must always be labeled as synthetic in the UI (see `source` label in `data.py`).

## 8. When adding a new agent
1. Implement a `.weights(ctx) -> pd.Series` method returning exposure in `[0, 1]`.
2. Add it to the `agents` list in `arena.py`.
3. Decide if it should be a `COUNCIL_MEMBERS` constituent — document the reasoning in `memory.md`.
4. Add a look-ahead test case for it.
5. Update `docs/prd.md` section 7 (Key features) if it's user-facing.
