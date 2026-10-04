# 🌐 TradeSphere AI

### Autonomous Multi-Agent Algorithmic Trading & Risk Analysis Platform

TradeSphere AI is an AI/ML-based algorithmic trading research platform that brings together **Machine Learning, Reinforcement Learning, Market Regime Detection, Multi-Agent Decision Making, Backtesting, Risk Analysis, Portfolio Optimization, and Sentiment Analysis** into one interactive trading laboratory.

The project is designed to evaluate trading strategies fairly using historical market data, walk-forward validation, transaction costs, risk metrics, and simulated market stress scenarios.

> ⚠️ **Disclaimer:** TradeSphere AI is an educational and research project. It does not provide financial advice, execute real trades, or connect to a live brokerage account.

---

## 🚀 Live Demo

### 🌐 Live Website

**[TradeSphere AI — Live Demo](https://trade-sphere-ai-ten.vercel.app/)**

Explore the interactive Gen-Z glassmorphic dashboard and simulated multi-agent trading council.

The deployed interface demonstrates agent consensus, market-regime analysis, risk controls, and paper-portfolio concepts. The live demo does **not** connect to live market data or execute broker orders.

---

## 📂 Source Code

**[GitHub Repository](https://github.com/Pranabdevelop/TradeSphere-AI)**

---

# 🎯 Problem Statement

Trading strategies can easily look successful when evaluated using a single backtest.

A reliable evaluation system should consider:

- Look-ahead bias
- Transaction costs
- Out-of-sample performance
- Risk-adjusted returns
- Market regimes
- Portfolio risk
- Extreme market conditions
- Comparison against simple baseline strategies

TradeSphere AI addresses these challenges by creating an environment where multiple trading agents can be trained, evaluated, compared, and stress-tested using a consistent evaluation pipeline.

---

# ✨ Key Features

## 🤖 Multi-Agent Trading Arena

The platform evaluates seven different trading approaches on the same out-of-sample period:

| Agent | Strategy |
|---|---|
| 🏦 Buy & Hold | Passive benchmark |
| 📈 Momentum | SMA crossover |
| 🔄 Mean Reversion | RSI-based strategy |
| 🧠 ML Forecaster | Machine-learning prediction |
| 🌦️ Regime Switcher | Market-regime based strategy |
| 🎯 Q-Learning Agent | Reinforcement-learning strategy |
| 👥 Council | Ensemble of multiple agents |

This allows different strategies to be compared under the same conditions.

---

# 🧠 Machine Learning Forecaster

The ML pipeline predicts whether the price will be higher after a specified prediction horizon.

Supported models include:

- Random Forest
- Gradient Boosting
- Logistic Regression

The model uses historical market features and **walk-forward validation** instead of randomly mixing future and past observations.

A label-leakage guard is also included to prevent future information from influencing historical predictions.

---

# 🎯 Reinforcement Learning

TradeSphere AI includes a **tabular Q-Learning trading agent**.

The RL agent learns from market states based on:

- RSI
- Trend
- Volatility
- Current position

Available actions:

```text
Flat
Long
```

The Q-learning update follows:

```text
Q(s,p,a) ← Q(s,p,a) + α[
    r + γ max Q(s',p,a') − Q(s,p,a)
]
```

The agent uses an **ε-greedy exploration strategy** that gradually reduces exploration during training.

The deliberately small state space makes the RL agent fast and easier to explain.

---

# 🌦️ Market Regime Detection

Market conditions can change significantly over time.

TradeSphere AI uses a **Gaussian Mixture Model (GMM)** to classify market behavior into:

- 🟢 Bull
- 🟡 Sideways
- 🔴 Bear

The detected regime can influence how trading agents manage their exposure.

---

# 👥 Agent Council

One of the key ideas behind TradeSphere AI is that a trading decision should not necessarily depend on one strategy.

The **Agent Council** combines multiple perspectives to generate a weighted consensus.

The live demo showcases four simulated perspectives:

### 📈 Momentum Agent

Focuses on trend continuation and breakout opportunities.

### 📊 Quant Hedger

Focuses on downside and macro-risk conditions.

### 🌦️ Regime Detector

Tracks the current market phase and risk-on/risk-off conditions.

### 🛡️ Chief Risk Officer

Focuses on position sizing, stops, and risk limits.

The agents provide confidence scores and voting weights which are combined into a consensus signal. The deployed feed is explicitly simulated for demonstration and is not connected to live market data.

---

# 📊 Backtesting Engine

The backtesting engine evaluates trading strategies while considering realistic trading constraints.

It supports:

- Transaction costs
- Position sizing
- Portfolio exposure
- Volatility targeting
- Out-of-sample evaluation

### Performance Metrics

The system calculates:

- Total Return
- CAGR
- Annual Volatility
- Sharpe Ratio
- Sortino Ratio
- Calmar Ratio
- Maximum Drawdown
- Win Rate
- Exposure
- Trade Count

---

# 🛡️ Risk Analysis Lab

TradeSphere AI evaluates both **returns and downside risk**.

## Value at Risk — VaR

Historical VaR is calculated at:

- 95% confidence
- 99% confidence

## Conditional Value at Risk — CVaR

CVaR measures the average loss in the extreme tail beyond the VaR threshold.

## Monte Carlo Simulation

Bootstrap-based Monte Carlo simulations are used to explore possible future return distributions and estimate:

- Probability of loss
- Potential drawdowns
- Return uncertainty
- Tail risk

---

# 💥 Stress Testing

Trading strategies can be tested against simulated extreme market conditions.

### 📉 Flash Crash

Simulates a sudden severe market decline.

### 📉 Rate-Hike Bear Market

Simulates an extended bearish environment.

### 📈 Melt-Up

Simulates an unusually strong bullish market.

### 🌪️ Volatility Storm

Simulates a period of extreme market volatility.

Stress testing helps determine how strategies behave when market conditions become abnormal.

---

# 📈 Portfolio Optimization

The Portfolio Lab provides quantitative portfolio analysis.

It includes:

- Asset correlation analysis
- Correlation heatmaps
- Markowitz Efficient Frontier
- Maximum-Sharpe portfolio
- Minimum-volatility portfolio
- Portfolio weight analysis

This allows users to study the relationship between **portfolio risk and expected return**.

---

# 📰 Sentiment Analysis

TradeSphere AI includes a lightweight financial headline sentiment engine.

It supports:

- Positive sentiment detection
- Negative sentiment detection
- Neutral sentiment
- Negation handling
- Sentiment-based exposure adjustment

The sentiment component can influence the ML agent's exposure.

---

# 🔬 Explainability

TradeSphere AI focuses on making AI-driven decisions easier to understand.

The project provides visual analysis for:

- Feature importance
- Agent exposure
- Trading signals
- Market regimes
- RL learning curves
- Strategy performance
- Risk metrics

The goal is to understand not only **what the system predicts**, but also how different strategies contribute to the final decision.

---

# 🏗️ System Architecture

```text
                       ┌─────────────────────┐
                       │     Market Data     │
                       │ Yahoo Finance /     │
                       │ Synthetic Market    │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Feature Engineering │
                       │   16 Indicators     │
                       └──────────┬──────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
      ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
      │ ML Forecaster │   │ Regime Model  │   │ Q-Learning RL │
      │ RF / GB / LR  │   │      GMM      │   │     Agent     │
      └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  ▼
                       ┌─────────────────────┐
                       │    Agent Arena      │
                       │                     │
                       │ Buy & Hold          │
                       │ Momentum            │
                       │ Mean Reversion      │
                       │ ML Forecaster       │
                       │ Regime Switcher     │
                       │ Q-Learning          │
                       │ Council             │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │    Backtesting      │
                       │ Costs + Metrics     │
                       └──────────┬──────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
      ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
      │ Risk Analysis│     │ Stress Tests │     │  Portfolio   │
      │ VaR / CVaR   │     │ Market Shocks│     │ Optimization │
      │ Monte Carlo  │     │              │     │ Efficient    │
      └──────────────┘     └──────────────┘     │ Frontier     │
                                                └──────────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Interactive Frontend│
                       │ Next.js / React     │
                       └─────────────────────┘
```

---

# 📁 Project Structure

```text
TradeSphere-AI/
│
├── backend/
│   ├── app.py
│   ├── run_demo.py
│   ├── test_pipeline.py
│   ├── requirements.txt
│   │
│   └── tradesphere/
│       ├── __init__.py
│       ├── data.py
│       ├── features.py
│       ├── models.py
│       ├── agents.py
│       ├── backtest.py
│       ├── arena.py
│       ├── risk.py
│       └── sentiment.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
│
├── docs/
│
├── pyrightconfig.json
└── README.md
```

The repository currently separates the Python trading/analysis backend from the Next.js frontend.

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend & AI

- Python
- Scikit-learn
- Pandas
- NumPy
- Machine Learning
- Reinforcement Learning
- Q-Learning
- Gaussian Mixture Models

## Quantitative Finance

- Algorithmic Trading
- Backtesting
- Technical Indicators
- Risk Management
- Portfolio Optimization
- Markowitz Efficient Frontier
- Monte Carlo Simulation
- VaR / CVaR

## Data

- Yahoo Finance
- Historical Market Data
- Synthetic Market Data

## Development

- Git
- GitHub
- Pytest
- Streamlit
- Vercel

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Pranabdevelop/TradeSphere-AI.git

cd TradeSphere-AI
```

---

## 2. Create Python Environment

### Windows

```powershell
py -m venv backend\.venv
```

Activate:

```powershell
backend\.venv\Scripts\Activate.ps1
```

---

## 3. Install Backend Dependencies

```powershell
python -m pip install -r backend\requirements.txt
```

---

## 4. Start the Backend

```powershell
cd backend
python -m streamlit run app.py
```

The Streamlit dashboard will normally be available at:

```text
http://localhost:8501
```

---

## 5. Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:3000
```

The repository's current setup instructions use the Streamlit backend and Next.js frontend separately.

---

# 🧪 Testing

Run the test suite:

```powershell
cd backend
python -m pytest -q
```

The project includes tests for important parts of the trading pipeline, including feature generation, ML signals, regime detection, RL decisions, and look-ahead protection.

---

# 📊 Running the Demo

Run the command-line demonstration:

```powershell
cd backend

python run_demo.py --ticker TCS.NS
```

Example tickers:

```text
TCS.NS
RELIANCE.NS
^NSEI
AAPL
```

The system also provides a synthetic-market fallback for offline experimentation.

---

# 🔐 Walk-Forward Validation

Financial time-series data cannot be evaluated like ordinary random datasets.

Using a random train/test split can accidentally expose the model to future information.

TradeSphere AI uses **walk-forward validation**:

```text
Historical Data
       │
       ▼
   Training
       │
       ▼
    Predict
       │
       ▼
 Future Block
       │
       ▼
Expand Training Window
       │
       └──────────────► Repeat
```

The ML model is repeatedly trained using information available at that point in time and then evaluated on a future block.

This helps reduce **look-ahead bias** and provides a more realistic evaluation of trading strategies.

---

# 🧠 Q-Learning Methodology

The RL agent represents the market using a compact state space based on:

- RSI bucket
- Trend bucket
- Volatility bucket
- Current position

Actions:

```text
Flat
Long
```

The agent learns using an ε-greedy exploration strategy and a Q-table.

The compact state space is intentionally designed to keep the model:

- Fast
- Explainable
- Easy to train
- Suitable for academic demonstration

---

# 📌 Honest Results & Limitations

Financial markets are highly noisy and difficult to predict.

TradeSphere AI does not claim that machine learning can consistently predict market direction.

The project documentation acknowledges that:

- ML performance may remain close to random
- ML strategies may fail to beat Buy & Hold
- Transaction costs can reduce returns
- Synthetic-market results can vary
- The RL state space is intentionally small
- The current system is long-only
- The current evaluation focuses on single-asset trading
- Slippage and liquidity are simplified
- Sentiment and regime components are simplified

The project's main objective is therefore **rigorous strategy evaluation, risk analysis, stress testing, and multi-agent experimentation**, rather than promising trading profits.

---

# 🔮 Future Enhancements

- [ ] Deep Q-Network (DQN)
- [ ] PPO reinforcement-learning agent
- [ ] LSTM price forecasting
- [ ] Transformer-based forecasting
- [ ] FinBERT financial sentiment
- [ ] Real-time news integration
- [ ] Multi-asset portfolio RL
- [ ] Short-selling support
- [ ] Stop-loss / take-profit optimization
- [ ] Slippage modelling
- [ ] Real-time market data
- [ ] Paper-trading API
- [ ] Broker integration
- [ ] Cloud-based ML inference

---

# 🎓 Concepts Demonstrated

### Artificial Intelligence

- Machine Learning
- Reinforcement Learning
- Multi-Agent Systems
- Explainable AI
- Sentiment Analysis

### Machine Learning

- Classification
- Feature Engineering
- Random Forest
- Gradient Boosting
- Logistic Regression
- Walk-Forward Validation

### Reinforcement Learning

- Q-Learning
- State Representation
- Reward Engineering
- ε-Greedy Exploration

### Unsupervised Learning

- Gaussian Mixture Models
- Market Regime Detection

### Quantitative Finance

- Algorithmic Trading
- Backtesting
- Risk Management
- Portfolio Optimization
- Monte Carlo Simulation
- VaR / CVaR
- Sharpe Ratio
- Maximum Drawdown

---

# 🎤 Viva & Interview Questions

### Why did you use walk-forward validation?

Financial data is time-dependent. Random train/test splitting can allow future information to influence training and produce unrealistic results.

### Why use multiple trading agents?

Different strategies behave differently under different market conditions. Comparing multiple agents gives a more comprehensive evaluation.

### Why use Q-Learning?

Q-Learning allows an agent to learn a trading policy through market states and rewards instead of only predicting future prices.

### What is Sharpe Ratio?

Sharpe Ratio measures risk-adjusted return by comparing excess return with portfolio volatility.

### What is Maximum Drawdown?

Maximum Drawdown represents the largest decline from a portfolio peak to a subsequent trough.

### What is VaR?

Value at Risk estimates a potential loss threshold at a selected confidence level.

### What is CVaR?

Conditional Value at Risk measures the average loss beyond the VaR threshold.

### Why use market regime detection?

Markets can behave differently during bullish, bearish, and sideways periods. Regime detection allows strategies to adapt to changing conditions.

### What is the Agent Council?

The Agent Council combines different strategy perspectives and produces a weighted consensus instead of relying on a single trading strategy.

---

# 📜 Disclaimer

TradeSphere AI is strictly an **educational and research project**.

The application:

- Does not provide financial advice
- Does not guarantee investment returns
- Does not execute real trades
- Does not connect to a live broker
- Uses simulated signals in the deployed demonstration

The live website itself states that the agent feed is simulated and is not connected to live market data or a broker.

**Do not use the outputs of this project as a basis for real-world investment decisions.**

---

# 👨‍💻 Author

## Pranab

**TradeSphere AI**

### Project Links

🌐 **Live Website:**  
https://trade-sphere-ai-ten.vercel.app/

💻 **GitHub Repository:**  
https://github.com/Pranabdevelop/TradeSphere-AI

---

## ⭐ Support the Project

If you found TradeSphere AI interesting, consider giving the repository a ⭐ on GitHub.

**Built with Machine Learning, Reinforcement Learning, Multi-Agent Systems, and Quantitative Finance.**
