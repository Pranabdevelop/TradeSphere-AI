"""TradeSphere AI dashboard.  Run with:  streamlit run app.py"""
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from tradesphere.arena import SCENARIOS, apply_scenario, run_arena, split_index
from tradesphere.data import load_prices
from tradesphere.models import MODELS, regime_stats
from tradesphere.risk import efficient_frontier, mc_summary, monte_carlo, var_cvar
from tradesphere.sentiment import score_headlines, sentiment_tilt

st.set_page_config(page_title="TradeSphere AI", page_icon="🌐", layout="wide")
REGIME_COLORS = {"Bear": "#d62728", "Sideways": "#8c8c8c", "Bull": "#2ca02c"}


@st.cache_data(show_spinner="Loading prices...", ttl=3600)
def get_data(ticker, years, synthetic):
    return load_prices(ticker, years, synthetic)


@st.cache_data(show_spinner="Training ML + RL agents (walk-forward)...")
def get_arena(df, model, frac, cost, episodes, vol_target, horizon):
    return run_arena(df, model, frac, cost, episodes, vol_target, horizon=horizon)


# ------------------------------------------------------------------ sidebar
st.sidebar.title("🌐 TradeSphere AI")
st.sidebar.caption("Multi-agent ML & RL trading research lab")
ticker = st.sidebar.text_input("Ticker (Yahoo Finance)", "RELIANCE.NS")
years = st.sidebar.slider("History (years)", 3, 10, 5)
synthetic = st.sidebar.checkbox("Use synthetic market (offline demo)", value=False)
st.sidebar.divider()
model_name = st.sidebar.selectbox("Forecasting model", list(MODELS))
horizon = st.sidebar.slider("Forecast horizon (days)", 1, 10, 5)
train_frac = st.sidebar.slider("Training fraction", 0.5, 0.8, 0.6, 0.05)
cost_bps = st.sidebar.slider("Transaction cost (bps per trade)", 0, 50, 10)
rl_eps = st.sidebar.slider("RL training episodes", 20, 150, 60, 10)
use_vt = st.sidebar.checkbox("Volatility-targeting risk overlay", value=False)
vol_target = st.sidebar.slider("Target annual volatility", 0.05, 0.40, 0.15, 0.01) if use_vt else None
st.sidebar.warning("Educational project. Not investment advice.")

df, source = get_data(ticker.strip(), years, synthetic)
st.title("TradeSphere AI")
st.caption(f"Data source: **{source}**  |  {len(df)} daily bars  |  {df.index[0].date()} to {df.index[-1].date()}")
if len(df) < 400:
    st.error("Need at least 400 daily bars. Increase the history or pick another ticker.")
    st.stop()

res = get_arena(df, model_name, train_frac, cost_bps, rl_eps, vol_target, horizon)
test_dates = res.close.index[res.test_start]

tabs = st.tabs(["📈 Market & Regimes", "🤖 ML Forecast", "🏆 Agent Arena", "💥 Stress Test",
                "⚠️ Risk Lab", "🧮 Portfolio Lab", "📰 Sentiment Lab"])

# ------------------------------------------------------------------ 1. market
with tabs[0]:
    fig = go.Figure(go.Candlestick(x=df.index, open=df["Open"], high=df["High"], low=df["Low"],
                                   close=df["Close"], name="Price"))
    for n_, col in ((20, "#1f77b4"), (50, "#ff7f0e")):
        fig.add_trace(go.Scatter(x=df.index, y=df["Close"].rolling(n_).mean(), name=f"SMA {n_}",
                                 line=dict(color=col, width=1)))
    fig.update_layout(xaxis_rangeslider_visible=False, height=430, margin=dict(t=20, b=10))
    st.plotly_chart(fig)

    st.subheader("Market regimes (Gaussian Mixture on 20-day return & volatility)")
    fig = go.Figure()
    for name, colr in REGIME_COLORS.items():
        m = res.regimes == name
        fig.add_trace(go.Scatter(x=df.index[m], y=df["Close"][m], mode="markers", name=name,
                                 marker=dict(size=4, color=colr)))
    fig.update_layout(height=320, margin=dict(t=10, b=10))
    st.plotly_chart(fig)
    st.dataframe(regime_stats(res.close, res.regimes))
    st.caption("The regime model is fitted on the first part of history only, then applied forward.")

# ------------------------------------------------------------------ 2. ML
with tabs[1]:
    ev = res.ml_eval
    c = st.columns(5)
    c[0].metric("Out-of-sample accuracy", f"{ev['Accuracy %']}%")
    c[1].metric("Majority baseline", f"{ev['Majority-class baseline %']}%")
    c[2].metric("ROC-AUC", ev["ROC-AUC"])
    c[3].metric("Test samples", ev["Test samples"])
    c[4].metric(f"P(up in {horizon}d), latest", f"{res.next_day_proba:.1%}")
    st.caption("Walk-forward validation: the model is re-trained every 40 days on past data only. "
               "An AUC near 0.50 means little predictive edge, which is normal for liquid markets. "
               "Compare accuracy with the majority baseline, not with 50%.")
    left, right = st.columns(2)
    imp = res.importance.head(12)[::-1]
    fig = go.Figure(go.Bar(x=imp.values, y=imp.index, orientation="h"))
    fig.update_layout(title="Feature importance", height=380, margin=dict(t=40, b=10))
    left.plotly_chart(fig)
    p = res.proba.iloc[res.test_start:]
    fig = go.Figure(go.Scatter(x=p.index, y=p.values, name="P(up)"))
    fig.add_hline(y=0.5, line_dash="dash")
    fig.update_layout(title="Predicted probability of a rise (out-of-sample)", height=380, margin=dict(t=40, b=10))
    right.plotly_chart(fig)

# ------------------------------------------------------------------ 3. arena
with tabs[2]:
    st.subheader(f"Leaderboard (out-of-sample, from {test_dates.date()})")
    st.dataframe(res.metrics)
    fig, dd = go.Figure(), go.Figure()
    for name, r in res.results.items():
        eq = r["equity"] / r["equity"].iloc[0] * 100
        style = dict(dash="dash", color="black") if name == "Buy & Hold" else {}
        fig.add_trace(go.Scatter(x=eq.index, y=eq, name=name, line=style))
        dd.add_trace(go.Scatter(x=eq.index, y=(eq / eq.cummax() - 1) * 100, name=name, line=style))
    fig.update_layout(title="Equity curves (start = 100)", height=420, margin=dict(t=40, b=10))
    dd.update_layout(title="Drawdown (%)", height=300, margin=dict(t=40, b=10))
    st.plotly_chart(fig)
    st.plotly_chart(dd)

    left, right = st.columns(2)
    pick = left.selectbox("Inspect agent exposure", list(res.results))
    w = res.results[pick]["weights"]
    fig = go.Figure(go.Scatter(x=w.index, y=w.values * 100, fill="tozeroy", line_shape="hv"))
    fig.update_layout(title=f"{pick}: exposure (%)", height=280, margin=dict(t=40, b=10))
    left.plotly_chart(fig)
    fig = go.Figure(go.Scatter(y=res.rl_rewards, mode="lines+markers"))
    fig.update_layout(title="RL learning curve (total reward per episode)", height=280, margin=dict(t=40, b=10))
    right.plotly_chart(fig)

    st.subheader("Latest target exposure suggested by each agent")
    st.dataframe(pd.Series(res.latest_weights, name="Exposure %").mul(100).round(1))

# ------------------------------------------------------------------ 4. stress test
with tabs[3]:
    st.write("Inject a synthetic shock into the out-of-sample period and see which agents survive.")
    c = st.columns(4)
    scen = c[0].selectbox("Scenario", SCENARIOS)
    mag = c[1].slider("Severity", 0.05, 0.40, 0.20, 0.05)
    length = c[2].slider("Duration (days)", 5, 60, 20)
    when = c[3].slider("Timing in test window (%)", 5, 80, 40)
    n = len(df)
    start = min(split_index(n, train_frac) + int((n - split_index(n, train_frac)) * when / 100), n - 8)
    shocked = apply_scenario(df, scen, start, mag, length)
    res2 = get_arena(shocked, model_name, train_frac, cost_bps, rl_eps, vol_target, horizon)
    cmp = pd.concat({"Base": res.metrics[["Total Return %", "Sharpe", "Max DD %"]],
                     "Shocked": res2.metrics[["Total Return %", "Sharpe", "Max DD %"]]}, axis=1)
    st.dataframe(cmp.sort_values(("Shocked", "Sharpe"), ascending=False))
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df.index, y=df["Close"], name="Original"))
    fig.add_trace(go.Scatter(x=shocked.index, y=shocked["Close"], name=f"With {scen.lower()}"))
    fig.update_layout(height=340, margin=dict(t=10, b=10))
    st.plotly_chart(fig)

# ------------------------------------------------------------------ 5. risk
with tabs[4]:
    agent = st.selectbox("Agent to analyse", list(res.results), key="risk_agent")
    rets = res.results[agent]["returns"].iloc[1:]
    c = st.columns(4)
    for i, lvl in enumerate((0.95, 0.99)):
        v, cv = var_cvar(rets, lvl)
        c[2 * i].metric(f"VaR {int(lvl * 100)}% (1 day)", f"{v:.2%}")
        c[2 * i + 1].metric(f"CVaR {int(lvl * 100)}% (1 day)", f"{cv:.2%}")
    fig = go.Figure(go.Histogram(x=rets * 100, nbinsx=60))
    fig.update_layout(title="Daily return distribution (%)", height=300, margin=dict(t=40, b=10))
    st.plotly_chart(fig)

    horizon_mc = st.slider("Monte-Carlo horizon (trading days)", 60, 504, 252)
    paths = monte_carlo(rets, horizon_mc)
    q = np.percentile(paths, [5, 50, 95], axis=0)
    x = np.arange(1, horizon_mc + 1)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=x, y=q[2], line=dict(width=0), showlegend=False))
    fig.add_trace(go.Scatter(x=x, y=q[0], fill="tonexty", line=dict(width=0), name="5th-95th percentile"))
    fig.add_trace(go.Scatter(x=x, y=q[1], name="Median", line=dict(color="black")))
    fig.update_layout(title="Bootstrapped Monte-Carlo wealth paths (start = 1.0)", height=340, margin=dict(t=40, b=10))
    st.plotly_chart(fig)
    s = mc_summary(paths)
    c = st.columns(4)
    c[0].metric("Median outcome", f"{s['Median outcome']:.2f}x")
    c[1].metric("5th percentile", f"{s['5th percentile']:.2f}x")
    c[2].metric("95th percentile", f"{s['95th percentile']:.2f}x")
    c[3].metric("Probability of loss", f"{s['P(loss)']:.0%}")

# ------------------------------------------------------------------ 6. portfolio
with tabs[5]:
    tickers_txt = st.text_input("Tickers (comma-separated)", "TCS.NS, INFY.NS, HDFCBANK.NS, RELIANCE.NS")
    names = [t.strip() for t in tickers_txt.split(",") if t.strip()]
    if len(names) < 2:
        st.info("Enter at least two tickers.")
    else:
        prices = pd.concat({t: get_data(t, years, synthetic)[0]["Close"] for t in names}, axis=1).dropna()
        if len(prices) < 250:
            st.warning("Not enough overlapping history for these tickers.")
        else:
            corr = prices.pct_change().corr()
            fig = go.Figure(go.Heatmap(z=corr.values, x=corr.columns, y=corr.index, zmin=-1, zmax=1,
                                       colorscale="RdBu", text=corr.round(2).values, texttemplate="%{text}"))
            fig.update_layout(title="Return correlation", height=380, margin=dict(t=40, b=10))
            st.plotly_chart(fig)
            cloud, best, safe = efficient_frontier(prices)
            fig = go.Figure(go.Scatter(x=cloud["Volatility"], y=cloud["Return"], mode="markers",
                                       marker=dict(size=4, color=cloud["Sharpe"], colorscale="Viridis",
                                                   showscale=True, colorbar=dict(title="Sharpe"))))
            fig.update_layout(title="Efficient frontier (4,000 random portfolios)", xaxis_title="Volatility",
                              yaxis_title="Expected return", height=420, margin=dict(t=40, b=10))
            st.plotly_chart(fig)
            st.dataframe((pd.DataFrame({"Max Sharpe": best, "Min Volatility": safe}) * 100).round(1))

# ------------------------------------------------------------------ 7. sentiment
with tabs[6]:
    st.write("Paste headlines (one per line). The score nudges the ML Forecaster's latest exposure.")
    sample = ("Company reports record profit and raises dividend\n"
              "Regulator opens probe into accounting fraud claims\n"
              "Analysts upgrade stock after strong quarterly growth\n"
              "Management warns of weak demand and possible layoffs")
    heads = st.text_area("Headlines", sample, height=150).splitlines()
    sc = score_headlines(heads)
    if not sc.empty:
        st.dataframe(sc)
        avg = float(sc["Score"].mean())
        base = res.latest_weights["ML Forecaster"]
        strength = st.slider("Sentiment influence", 0.0, 1.0, 0.3, 0.05)
        c = st.columns(3)
        c[0].metric("Average sentiment", f"{avg:+.2f}")
        c[1].metric("ML exposure (before)", f"{base:.0%}")
        c[2].metric("ML exposure (after news tilt)", f"{sentiment_tilt(base, avg, strength):.0%}")
