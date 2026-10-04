"use client";

import { useState } from "react";
import { Gauge, ShieldAlert } from "lucide-react";

export default function RiskLab() {
  const [risk, setRisk] = useState(4);
  const [leverage, setLeverage] = useState(1);
  const maxDrawdown = Math.min(48, risk * Math.sqrt(leverage) * 2.8);
  const valueAtRisk = risk * leverage * 1.65;
  const sharpe = Math.max(0.1, 1.65 - risk * 0.075 - (leverage - 1) * 0.12);

  const metrics = [
    { label: "Estimated max drawdown", value: `${maxDrawdown.toFixed(1)}%`, note: "Stress estimate", color: "bg-clay/15 text-rust" },
    { label: "1-day VaR · 95%", value: `${valueAtRisk.toFixed(1)}%`, note: "Of portfolio value", color: "bg-lavender text-violet-800" },
    { label: "Simulated Sharpe", value: sharpe.toFixed(2), note: "Illustrative annualized", color: "bg-sage/20 text-moss" },
  ];

  return (
    <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Portfolio guardrails</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Risk lab</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/60">Tune the demo risk budget and leverage. Estimates recalculate immediately as you adjust the controls.</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-butter/40 px-3 py-2 text-xs font-bold"><ShieldAlert size={15} /> Model estimates</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8 rounded-3xl bg-cream/70 p-5 sm:p-7">
          <label className="block">
            <span className="flex items-center justify-between font-bold">
              Portfolio risk tolerance
              <span className="rounded-full bg-white px-3 py-1 font-display text-lg tabular-nums">{risk}%</span>
            </span>
            <span className="mt-1 block text-xs text-ink/50">Risk budget per position · 1% to 10%</span>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={risk}
              onChange={(event) => setRisk(Number(event.target.value))}
              className="mt-5 h-2 w-full cursor-pointer accent-clay"
            />
            <span className="flex justify-between text-[10px] font-semibold text-ink/45"><span>Conservative · 1%</span><span>Flexible · 10%</span></span>
          </label>
          <label className="block">
            <span className="flex items-center justify-between font-bold">
              Leverage
              <span className="rounded-full bg-white px-3 py-1 font-display text-lg tabular-nums">{leverage}x</span>
            </span>
            <span className="mt-1 block text-xs text-ink/50">Gross exposure multiplier · 1x to 5x</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={leverage}
              onChange={(event) => setLeverage(Number(event.target.value))}
              className="mt-5 h-2 w-full cursor-pointer accent-moss"
            />
            <span className="flex justify-between text-[10px] font-semibold text-ink/45"><span>Unlevered · 1x</span><span>High exposure · 5x</span></span>
          </label>
          <div className="flex items-start gap-3 rounded-2xl border border-ink/5 bg-white/70 p-4 text-xs leading-relaxed text-ink/55">
            <Gauge className="mt-0.5 shrink-0 text-moss" size={16} />
            Estimates use a simplified illustrative risk model, not historical portfolio data or a guarantee of future performance.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-1">
          {metrics.map((metric) => (
            <article key={metric.label} className="flex items-center justify-between gap-4 rounded-3xl border border-ink/5 bg-white/75 p-5">
              <div>
                <h3 className="font-semibold">{metric.label}</h3>
                <p className="mt-1 text-xs text-ink/50">{metric.note}</p>
              </div>
              <span className={`rounded-2xl px-4 py-2 font-display text-2xl font-bold tabular-nums ${metric.color}`}>{metric.value}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
