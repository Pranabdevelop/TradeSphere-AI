"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Shield, Waves } from "lucide-react";
import type { Regime } from "./RegimeSwitcher";

type Agent = {
  name: string;
  role: string;
  tone: string;
  color: string;
  icon: typeof Activity;
  confidence: number;
  stance: number;
  comment: string;
};

const baseAgents: Agent[] = [
  {
    name: "Momentum Agent",
    role: "Aggressive growth · Bull",
    tone: "The trend is intact. Let winners run, but trail the stop.",
    color: "bg-clay/10 text-clay",
    icon: ArrowUpRight,
    confidence: 82,
    stance: 1,
    comment: "Price structure is holding above the short-term trend.",
  },
  {
    name: "Quant Hedger",
    role: "Bear · Macro risks",
    tone: "Volatility is pricing in risk. Reduce exposure into the event.",
    color: "bg-lavender text-violet-800",
    icon: ArrowDownRight,
    confidence: 67,
    stance: 0,
    comment: "Cross-asset volatility argues for a measured hedge.",
  },
  {
    name: "Regime Detector",
    role: "HMM · Market phase tracker",
    tone: "The current phase is stable; watch for a volatility transition.",
    color: "bg-sage/20 text-moss",
    icon: Waves,
    confidence: 76,
    stance: 0.65,
    comment: "Regime probabilities favor continuation over a phase change.",
  },
  {
    name: "Chief Risk Officer",
    role: "Stops · Position sizing guardian",
    tone: "Keep downside bounded. Size positions to the risk budget.",
    color: "bg-butter/35 text-ink",
    icon: Shield,
    confidence: 91,
    stance: 0.5,
    comment: "Portfolio risk remains inside the selected tolerance.",
  },
];

const weightsByRegime: Record<Regime, number[]> = {
  "Bull Euphoria": [38, 12, 30, 20],
  "Chop/Sideways": [18, 25, 27, 30],
  "Liquidity Flush (Crash)": [5, 5, 10, 80],
  "High Volatility CPI Day": [10, 30, 15, 45],
};

const regimeNotes: Record<Regime, string[]> = {
  "Bull Euphoria": [
    "Momentum is accelerating. I recommend adding on a confirmed breakout.",
    "Crowded longs are fragile. Keep a hedge against a macro surprise.",
    "Trend persistence is elevated; phase remains risk-on for now.",
    "Scale in gradually. A strong tape is not a reason to ignore stops.",
  ],
  "Chop/Sideways": [
    "The breakout lacks follow-through. I am reducing chase risk.",
    "Range-bound conditions favor smaller, hedged positions.",
    "No decisive transition detected. Neutral conditions remain in control.",
    "Whipsaw risk is high; I am lowering the portfolio heat.",
  ],
  "Liquidity Flush (Crash)": [
    "Momentum has broken down. I am standing aside until price stabilizes.",
    "Liquidity is thin. Preserve capital and avoid forced exits.",
    "Crash regime probability is dominant; risk-on signals are suppressed.",
    "Capital preservation first: cut gross exposure and enforce hard stops.",
  ],
  "High Volatility CPI Day": [
    "Volatility is elevated. I will wait for the initial reaction to settle.",
    "Event risk is asymmetric. A protective hedge is warranted.",
    "The event can trigger a rapid regime shift; confidence is deliberately lower.",
    "Limit leverage and size down until post-event volatility normalizes.",
  ],
};

function actionLabel(score: number) {
  if (score >= 0.62) return { label: "STRONG BUY", style: "bg-sage/25 text-moss" };
  if (score <= 0.38) return { label: "CASH OUT", style: "bg-clay/15 text-rust" };
  return { label: "HEDGE", style: "bg-butter/40 text-ink" };
}

export default function LiveAgentArena({ regime }: { regime: Regime }) {
  const [pulse, setPulse] = useState(0);
  const weights = weightsByRegime[regime];

  useEffect(() => {
    const timer = window.setInterval(() => setPulse((value) => value + 1), 3200);
    return () => window.clearInterval(timer);
  }, []);

  const agents = useMemo(
    () =>
      baseAgents.map((agent, index) => {
        const cycle = Math.sin((pulse + index * 3) / 2.2) * 4;
        const riskRegime = regime === "Liquidity Flush (Crash)" || regime === "High Volatility CPI Day";
        const stance = regime === "Liquidity Flush (Crash)"
          ? [0, 0.05, 0.1, 0.12][index]
          : regime === "High Volatility CPI Day"
            ? [0.35, 0.1, 0.45, 0.35][index]
            : regime === "Chop/Sideways"
              ? [0.55, 0.4, 0.5, 0.45][index]
              : agent.stance;
        return {
          ...agent,
          confidence: Math.max(40, Math.min(98, Math.round(agent.confidence + cycle))),
          weight: weights[index],
          stance,
          comment: regimeNotes[regime][index],
          tone: riskRegime && index === 3
            ? "Risk-off protocol active. Protect capital before seeking new entries."
            : agent.tone,
        };
      }),
    [pulse, regime, weights],
  );

  const consensusScore =
    agents.reduce((sum, agent) => sum + agent.stance * agent.confidence * agent.weight, 0) /
    agents.reduce((sum, agent) => sum + agent.confidence * agent.weight, 0);
  const consensus = actionLabel(consensusScore);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Live agent arena</span>
            <h2 className="mt-2 font-display text-3xl font-bold">The debate feed</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage/20 px-3 py-1.5 text-xs font-semibold text-moss">
            <span className="h-2 w-2 animate-pulse rounded-full bg-moss" />
            Simulated feed · auto-refresh
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/60">Illustrative agent scores refresh every few seconds. Weights adapt to the selected market regime; no live data feed is connected.</p>

        <div className="mt-6 space-y-3">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <article key={agent.name} className="rounded-2xl border border-ink/5 bg-cream/60 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${agent.color}`}>
                      <Icon size={19} />
                    </span>
                    <div>
                      <h3 className="font-bold">{agent.name}</h3>
                      <p className="text-xs text-ink/55">{agent.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums">{agent.confidence}%</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/45">confidence</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">&ldquo;{agent.comment}&rdquo;</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/5">
                    <div className="h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${agent.weight}%` }} />
                  </div>
                  <span className="min-w-16 text-right text-xs font-semibold text-ink/60">Vote {agent.weight}%</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-[2rem] bg-ink p-6 text-cream shadow-xl shadow-ink/10 sm:p-7">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-butter">Weighted consensus</span>
          <p className="mt-5 font-display text-4xl font-bold">{consensus.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-cream/65">
            Combined agent signal for <span className="text-cream">{regime}</span>, weighted by confidence and vote share.
          </p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Consensus strength</span><span className="font-bold tabular-nums">{Math.round(consensusScore * 100)}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/15">
              <div className="h-full rounded-full bg-butter transition-all duration-700" style={{ width: `${consensusScore * 100}%` }} />
            </div>
          </div>
          <span className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${consensus.style}`}>
            Consensus · {consensus.label}
          </span>
        </div>
        <div className="rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-lg shadow-ink/5 backdrop-blur-xl">
          <h3 className="font-display text-xl font-bold">Agent voice & tone</h3>
          <p className="mt-1 text-sm text-ink/55">Latest simulated CRO broadcast</p>
          <blockquote className="mt-4 border-l-2 border-clay pl-4 text-sm leading-relaxed text-ink/75">
            &ldquo;{agents[3].tone}&rdquo;
          </blockquote>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-moss">
            <Activity size={14} /> Simulated voices · all 4 agents
          </div>
        </div>
        <p className="px-2 text-xs leading-relaxed text-ink/45">
          Simulated signals for product demonstration only; this feed is not connected to a broker or live market data.
        </p>
      </aside>
    </section>
  );
}
