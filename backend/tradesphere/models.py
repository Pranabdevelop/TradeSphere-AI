"""ML layer: walk-forward direction forecasting (no look-ahead) and market-regime detection."""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.mixture import GaussianMixture
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

MODELS = {
    "Random Forest": lambda: RandomForestClassifier(
        n_estimators=150, max_depth=4, min_samples_leaf=25, max_features="sqrt", n_jobs=-1, random_state=0),
    "Gradient Boosting": lambda: GradientBoostingClassifier(
        n_estimators=80, max_depth=2, learning_rate=0.05, subsample=0.8, random_state=0),
    "Logistic Regression": lambda: make_pipeline(
        StandardScaler(), LogisticRegression(C=0.5, max_iter=500)),
}


def walk_forward_proba(X: pd.DataFrame, y: pd.Series, model_factory, start: int = 150, step: int = 40,
                       horizon: int = 5) -> pd.Series:
    """P(up over the next `horizon` days) for every day from `start`, trained ONLY on earlier data.

    The model is re-trained every `step` days (expanding window). The label of row i uses the close of
    day i+horizon, so at decision time t only labels of rows i <= t-horizon are known -> the training
    rows are [0, t-horizon]. This guard is what prevents label leakage.
    """
    Xv, yv = X.values, y.values
    out = np.full(len(X), np.nan)
    for t0 in range(start, len(X), step):
        tr = np.arange(0, t0 - horizon + 1)
        ok = ~np.isnan(Xv[tr]).any(axis=1) & ~np.isnan(yv[tr])
        if ok.sum() < 60 or len(np.unique(yv[tr][ok])) < 2:
            continue
        model = model_factory().fit(Xv[tr][ok], yv[tr][ok])
        te = np.arange(t0, min(t0 + step, len(X)))
        te = te[~np.isnan(Xv[te]).any(axis=1)]
        if len(te):
            out[te] = model.predict_proba(Xv[te])[:, 1]
    return pd.Series(out, index=X.index, name="p_up")


def evaluate(proba: pd.Series, y: pd.Series) -> dict:
    m = proba.notna() & y.notna()
    p, t = proba[m], y[m]
    if len(t) == 0:
        return {}
    auc = roc_auc_score(t, p) if t.nunique() > 1 else float("nan")
    return {"Accuracy %": round(float(100 * ((p > 0.5) == (t == 1)).mean()), 2),
            "Majority-class baseline %": round(float(100 * max(t.mean(), 1 - t.mean())), 2),
            "ROC-AUC": round(float(auc), 3), "Test samples": int(len(t))}


def fit_latest(X: pd.DataFrame, y: pd.Series, model_factory):
    """Fit on every labelled row and return (P(up) for the newest bar, feature importance)."""
    ok = X.notna().all(axis=1) & y.notna()
    model = model_factory().fit(X[ok].values, y[ok].values)
    last = X.iloc[[-1]]
    p = float(model.predict_proba(last.values)[0, 1]) if last.notna().all(axis=1).iloc[0] else float("nan")
    est = model[-1] if hasattr(model, "steps") else model
    imp = est.feature_importances_ if hasattr(est, "feature_importances_") else np.abs(est.coef_[0])
    return p, pd.Series(imp, index=X.columns).sort_values(ascending=False)


# ---------------------------------------------------------------- regimes
REGIME_NAMES = ["Bear", "Sideways", "Bull"]


def detect_regimes(close: pd.Series, fit_n: int = 215, seed: int = 0) -> pd.Series:
    """Gaussian-Mixture regime detector on (20d mean return, 20d volatility).

    Fitted on the first `fit_n` observations only, then applied forward -> usable by trading agents
    without look-ahead. Clusters are named by their mean return (lowest = Bear, highest = Bull).
    """
    r = close.pct_change()
    Z = pd.DataFrame({"m": r.rolling(20).mean(), "v": r.rolling(20).std()}).dropna()
    fit = Z.iloc[:fit_n]
    Zs = (Z - fit.mean()) / fit.std()
    gmm = GaussianMixture(3, covariance_type="full", n_init=3, random_state=seed).fit(Zs.iloc[:fit_n].values)
    comp = gmm.predict(Zs.values)
    rank = {c: i for i, c in enumerate(np.argsort(gmm.means_[:, 0]))}
    labels = pd.Series([REGIME_NAMES[rank[c]] for c in comp], index=Z.index, name="regime")
    return labels.reindex(close.index)


def regime_stats(close: pd.Series, regimes: pd.Series) -> pd.DataFrame:
    r = close.pct_change()
    g = r.groupby(regimes)
    out = pd.DataFrame({"Days %": 100 * g.size() / regimes.notna().sum(),
                        "Avg daily return %": 100 * g.mean(),
                        "Daily volatility %": 100 * g.std()})
    return out.reindex(REGIME_NAMES).round(3)
