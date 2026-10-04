"use client";

import { useState } from "react";
import { Play, RefreshCw, Wallet } from "lucide-react";

type Simulation = {
  agents: number[];
  buyHold: number[];
  fills: { day: number; timestamp: string; side: string; price: string; reason: string }[];
};

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = 18;

function linePath(values: number[], min: number, max: number) {
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = PADDING + (index / Math.max(values.length - 1, 1)) * (WIDTH - 2 * PADDING);
    const y = HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - 2 * PADDING);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function runSimulation(seed: number): Simulation {
  let state = seed || 17;
  const random = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const agents = [100_000];
  const buyHold = [100_000];
  const fills: Simulation["fills"] = [];
  const reasons = [
    "Momentum confirmation; exposure scaled to risk budget.",
    "Regime filter turned cautious; trimming the position.",
    "Volatility expanded; CRO reduced gross exposure.",
    "Trend recovered; staged entry after confirmation.",
    "Protective hedge added ahead of event risk.",
  ];
  for (let day = 1; day <= 30; day += 1) {
    const marketReturn = (random() - 0.49) * 0.035;
    const agentReturn = marketReturn * (random() > 0.5 ? 0.85 : 1.2) + (random() - 0.49) * 0.009;
    agents.push(agents[day - 1] * (1 + agentReturn));
    buyHold.push(buyHold[day - 1] * (1 + marketReturn));
    if (day % 5 === 0) {
      fills.push({
        day,
        timestamp: new Date(Date.now() - (30 - day) * 24 * 60 * 60 * 1000).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        side: random() > 0.42 ? "BUY" : "TRIM",
        price: `$${(92 + random() * 18).toFixed(2)}`,
        reason: reasons[Math.floor(random() * reasons.length)],
      });
    }
  }
  return { agents, buyHold, fills };
}

export default function PortfolioSimulator() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [runNumber, setRunNumber] = useState(0);
  const startingCapital = 100_000;

  const run = () => {
    const nextRun = runNumber + 1;
    setRunNumber(nextRun);
    setSimulation(runSimulation(nextRun * 97 + 17));
  };
  const series = simulation ? [simulation.agents, simulation.buyHold] : [[startingCapital], [startingCapital]];
  const values = series.flat();
  const min = Math.min(...values) * 0.99;
  const max = Math.max(...values) * 1.01;
  const agentPath = linePath(series[0], min, max);
  const marketPath = linePath(series[1], min, max);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Paper portfolio · no broker connected</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Portfolio simulator</h2>
          <p className="mt-2 text-sm text-ink/60">A deterministic demo simulation for comparing strategy paths, not a live account.</p>
        </div>
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream shadow-chunkySm transition hover:-translate-y-0.5 hover:shadow-chunky"
        >
          {simulation ? <RefreshCw size={16} /> : <Play size={16} />}
          {simulation ? "Run another 30 days" : "Run 30-Day Walk-Forward Simulation"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-lg shadow-ink/5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/50"><Wallet size={15} /> Starting capital</div>
          <p className="mt-3 font-display text-3xl font-bold">$100,000</p>
          <p className="mt-1 text-xs text-ink/45">Mock paper balance</p>
        </article>
        <article className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-lg shadow-ink/5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink/50">TradeSphere Agents</div>
          <p className="mt-3 font-display text-3xl font-bold">{simulation ? `$${simulation.agents.at(-1)!.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}</p>
          <p className="mt-1 text-xs text-ink/45">{simulation ? `${(((simulation.agents.at(-1)! / startingCapital) - 1) * 100).toFixed(2)}% simulated return` : "Run simulation to generate a path"}</p>
        </article>
        <article className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-lg shadow-ink/5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink/50">Buy & Hold S&P 500</div>
          <p className="mt-3 font-display text-3xl font-bold">{simulation ? `$${simulation.buyHold.at(-1)!.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}</p>
          <p className="mt-1 text-xs text-ink/45">{simulation ? `${(((simulation.buyHold.at(-1)! / startingCapital) - 1) * 100).toFixed(2)}% simulated return` : "Same starting capital · 30-day window"}</p>
        </article>
      </div>

      <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Equity curve</span>
            <h3 className="mt-2 font-display text-xl font-bold">{simulation ? "30 simulated sessions" : "Your simulation will appear here"}</h3>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-clay" /> TradeSphere Agents</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-400" /> S&P 500</span>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Simulated equity curve comparing TradeSphere Agents with S&P 500 buy and hold" className="h-52 min-w-[540px] w-full overflow-visible">
            {[0, 1, 2, 3].map((row) => {
              const y = PADDING + (row * (HEIGHT - 2 * PADDING)) / 3;
              return <line key={row} x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} stroke="#2b2420" strokeOpacity="0.08" strokeDasharray="4 6" />;
            })}
            <path d={agentPath} fill="none" stroke="#D97757" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d={marketPath} fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 6" />
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-ink/40"><span>Session 0</span><span>Session 15</span><span>Session 30</span></div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-xl shadow-ink/5 backdrop-blur-xl">
        <div className="p-5 sm:p-7">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Paper fills</span>
          <h3 className="mt-2 font-display text-2xl font-bold">Execution log</h3>
        </div>
        {simulation ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-cream/70 text-[10px] uppercase tracking-wider text-ink/50">
                <tr><th className="px-6 py-3 font-bold">Timestamp</th><th className="px-4 py-3 font-bold">Side</th><th className="px-4 py-3 font-bold">Reference</th><th className="px-6 py-3 font-bold">Reasoning</th></tr>
              </thead>
              <tbody>
                {[...simulation.fills].reverse().map((fill) => (
                  <tr key={fill.day} className="border-t border-ink/5">
                    <td className="px-6 py-4 text-xs text-ink/60">{fill.timestamp} · Day {String(fill.day).padStart(2, "0")}</td>
                    <td className={`px-4 py-4 text-xs font-bold ${fill.side === "BUY" ? "text-moss" : "text-rust"}`}>{fill.side}</td>
                    <td className="px-4 py-4 font-semibold tabular-nums">{fill.price}</td>
                    <td className="px-6 py-4 text-xs text-ink/60">{fill.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border-t border-ink/5 px-6 py-8 text-sm text-ink/50">No simulated fills yet. Run the 30-day simulation to populate the paper execution log.</p>
        )}
      </div>
      <p className="px-2 text-xs leading-relaxed text-ink/45">
        Simulation only. This app does not execute orders, connect to a broker, or use real-time market data. Historical or simulated performance does not predict future results.
      </p>
    </section>
  );
}
