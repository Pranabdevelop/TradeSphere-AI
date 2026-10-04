import numpy as np
import pandas as pd

from tradesphere.arena import COUNCIL, SCENARIOS, apply_scenario, run_arena
from tradesphere.data import synthetic_prices
from tradesphere.features import add_features, make_target
from tradesphere.risk import efficient_frontier, monte_carlo, var_cvar
from tradesphere.sentiment import score_headline


def test_features_have_no_lookahead():
    df = synthetic_prices(600, seed=1)
    full = add_features(df)
    cut = add_features(df.iloc[:400])
    pd.testing.assert_frame_equal(full.iloc[:400], cut)          # past features never change


def test_target_horizon():
    df = synthetic_prices(300, seed=2)
    y1, y5 = make_target(df["Close"], 1), make_target(df["Close"], 5)
    assert np.isnan(y1.iloc[-1]) and y5.iloc[-5:].isna().all() and y5.iloc[-6:-5].notna().all()
    assert y1.iloc[10] == float(df["Close"].iloc[11] > df["Close"].iloc[10])
    assert y5.iloc[10] == float(df["Close"].iloc[15] > df["Close"].iloc[10])


def test_agents_have_no_lookahead():
    """Decisions on past days must not change when future data is deleted."""
    from tradesphere.agents import Context, MLForecaster, QLearner, RegimeSwitcher
    from tradesphere.models import MODELS, detect_regimes, walk_forward_proba
    df, ts, cut = synthetic_prices(900, seed=6), 550, 800

    def weights(d):
        f, close = add_features(d), d["Close"]
        proba = walk_forward_proba(f, make_target(close, 5), MODELS["Logistic Regression"], 150, 40, 5)
        ctx = Context(d, f, proba, detect_regimes(close, 215), ts)
        return [a.weights(ctx) for a in (MLForecaster(), RegimeSwitcher(), QLearner(episodes=8))]

    for full, part in zip(weights(df), weights(df.iloc[:cut])):
        np.testing.assert_allclose(full.iloc[:cut - 6].values, part.iloc[:cut - 6].values)


def test_arena_runs_and_weights_valid():
    res = run_arena(synthetic_prices(700, seed=3), rl_episodes=10)
    assert COUNCIL in res.results and "RL Q-Learner" in res.results
    for r in res.results.values():
        assert r["weights"].between(0, 1).all()
        assert np.isfinite(r["equity"]).all()
    assert 0 <= res.next_day_proba <= 1


def test_scenario_changes_prices_after_start_only():
    df = synthetic_prices(500, seed=4)
    shocked = apply_scenario(df, SCENARIOS[0], start=300)
    pd.testing.assert_series_equal(df["Close"].iloc[:300], shocked["Close"].iloc[:300])
    assert shocked["Close"].iloc[305] < df["Close"].iloc[305]


def test_risk_tools():
    r = synthetic_prices(600, seed=5)["Close"].pct_change().dropna()
    var, cvar = var_cvar(r)
    assert cvar >= var > 0
    assert monte_carlo(r, horizon=50, n_paths=100).shape == (100, 50)
    prices = pd.concat({t: synthetic_prices(400, seed=s)["Close"] for t, s in zip("ABC", (1, 2, 3))}, axis=1)
    _, best, safe = efficient_frontier(prices, n=500)
    assert abs(best.sum() - 1) < 1e-9 and abs(safe.sum() - 1) < 1e-9


def test_sentiment_negation():
    assert score_headline("Company profit surges on strong growth") > 0
    assert score_headline("Shares plunge after fraud probe") < 0
    assert score_headline("Company does not gain approval") < score_headline("Company gain approval")
