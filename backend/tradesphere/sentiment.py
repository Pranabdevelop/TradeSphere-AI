"""Lightweight finance-headline sentiment (lexicon + negation handling). No downloads needed."""
import re

import numpy as np
import pandas as pd

POSITIVE = {"surge", "surges", "rally", "rallies", "beat", "beats", "record", "growth", "profit", "profits",
            "gain", "gains", "upgrade", "upgraded", "strong", "boost", "boosts", "soar", "soars", "rise",
            "rises", "bullish", "outperform", "expansion", "approval", "approved", "dividend", "recovery",
            "optimism", "wins", "win", "jump", "jumps", "robust", "buyback"}
NEGATIVE = {"fall", "falls", "drop", "drops", "plunge", "plunges", "miss", "misses", "loss", "losses",
            "downgrade", "downgraded", "weak", "cut", "cuts", "slump", "slumps", "crash", "bearish",
            "fraud", "probe", "lawsuit", "layoffs", "default", "recession", "fear", "fears", "decline",
            "declines", "warning", "warns", "penalty", "ban", "inflation", "selloff", "debt"}
NEGATORS = {"not", "no", "never", "without", "fails", "failed", "cannot"}


def score_headline(text: str) -> float:
    """Return a score in [-1, 1]."""
    tokens, score = re.findall(r"[a-z']+", text.lower()), 0.0
    for i, tok in enumerate(tokens):
        s = 1.0 if tok in POSITIVE else -1.0 if tok in NEGATIVE else 0.0
        if s and i > 0 and tokens[i - 1] in NEGATORS:
            s = -s
        score += s
    return float(np.tanh(score / 2))


def score_headlines(headlines: list) -> pd.DataFrame:
    rows = [{"Headline": h, "Score": round(score_headline(h), 3)} for h in headlines if h.strip()]
    df = pd.DataFrame(rows)
    if not df.empty:
        df["Label"] = np.where(df["Score"] > 0.15, "Positive", np.where(df["Score"] < -0.15, "Negative", "Neutral"))
    return df


def sentiment_tilt(weight: float, sentiment: float, strength: float = 0.3) -> float:
    """Nudge a model's target exposure up/down by news sentiment, keeping it inside [0, 1]."""
    return float(np.clip(weight + strength * sentiment, 0.0, 1.0))
