"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Activity, CloudLightning, TrendingDown, TrendingUp } from "lucide-react";

export type Regime =
  | "Bull Euphoria"
  | "Chop/Sideways"
  | "Liquidity Flush (Crash)"
  | "High Volatility CPI Day";

const regimes: { name: Regime; icon: typeof Activity; detail: string; tone: string }[] = [
  { name: "Bull Euphoria", icon: TrendingUp, detail: "Broad participation · trend-following favored", tone: "text-moss bg-sage/20" },
  { name: "Chop/Sideways", icon: Activity, detail: "Low directionality · keep risk balanced", tone: "text-ink bg-butter/40" },
  { name: "Liquidity Flush (Crash)", icon: TrendingDown, detail: "Capital preservation · CRO takes control", tone: "text-rust bg-clay/15" },
  { name: "High Volatility CPI Day", icon: CloudLightning, detail: "Event risk · reduce leverage and wait", tone: "text-violet-800 bg-lavender" },
];

const barWeights: Record<Regime, number[]> = {
  "Bull Euphoria": [38, 12, 30, 20],
  "Chop/Sideways": [18, 25, 27, 30],
  "Liquidity Flush (Crash)": [5, 5, 10, 80],
  "High Volatility CPI Day": [10, 30, 15, 45],
};

const candles: Record<Regime, number[]> = {
  "Bull Euphoria": [26, 32, 44, 38, 50, 58, 49, 66, 72, 63, 83, 92, 77, 99, 109, 94, 116, 126, 112, 138],
  "Chop/Sideways": [70, 75, 66, 82, 71, 78, 68, 83, 72, 77, 65, 79, 70, 82, 68, 77, 66, 81, 72, 78],
  "Liquidity Flush (Crash)": [124, 116, 130, 104, 112, 89, 98, 72, 83, 56, 68, 44, 54, 32, 40, 22, 34, 18, 27, 13],
  "High Volatility CPI Day": [68, 106, 51, 119, 60, 128, 48, 105, 43, 124, 56, 113, 37, 121, 52, 109, 44, 126, 59, 98],
};

const team = [
  { label: "Momentum", color: "bg-clay" },
  { label: "Quant Hedger", color: "bg-violet-400" },
  { label: "Regime Detector", color: "bg-sage" },
  { label: "Chief Risk Officer", color: "bg-ink" },
];

export default function RegimeSwitcher({
  regime,
  onChange,
}: {
  regime: Regime;
  onChange: (regime: Regime) => void;
}) {
  const [ticker, setTicker] = useState("SPY");
  const weights = barWeights[regime];
  const bars = candles[regime];
  const selectedInfo = regimes.find((item) => item.name === regime)!;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Market phase control</span>
        <h2 className="mt-2 font-display text-3xl font-bold">Regime switcher</h2>
        <p className="mt-2 text-sm text-ink/60">Choose a scenario and watch the demo strategy rebalance its agent vote weights.</p>
        <div className="mt-6 space-y-3">
          {regimes.map(({ name, icon: Icon, detail, tone }) => (
            <button
              type="button"
              key={name}
              onClick={() => onChange(name)}
              aria-pressed={regime === name}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                regime === name
                  ? "border-ink/20 bg-white shadow-md shadow-ink/5"
                  : "border-transparent bg-cream/65 hover:bg-white/80"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span>
              <span className="flex-1">
                <span className="block font-bold">{name}</span>
                <span className="mt-1 block text-xs text-ink/55">{detail}</span>
              </span>
              <span className={`mt-1 h-3 w-3 rounded-full ${regime === name ? "bg-moss" : "bg-ink/10"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Illustrative price action</span>
              <h3 className="mt-2 font-display text-2xl font-bold">{ticker} · {regime}</h3>
            </div>
            <label className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold">
              Market
              <select value={ticker} onChange={(event) => setTicker(event.target.value)} className="bg-transparent text-rust outline-none">
                <option>SPY</option><option>QQQ</option><option>BTC</option>
              </select>
            </label>
          </div>
          <div className="mt-6 flex h-48 items-end justify-between gap-1 overflow-hidden rounded-2xl bg-cream/80 px-3 pt-5 sm:gap-2 sm:px-5">
            {bars.map((height, index) => {
              const open = bars[Math.max(index - 1, 0)];
              const up = height >= open;
              return (
                <motion.div
                  key={`${regime}-${index}`}
                  initial={{ height: 4, opacity: 0.3 }}
                  animate={{ height: `${Math.max(12, (height / 145) * 82)}%`, opacity: 1 }}
                  transition={{ duration: 0.45, delay: index * 0.012, type: "spring", stiffness: 90 }}
                  className={`relative w-full max-w-5 rounded-md ${up ? "bg-sage" : "bg-clay"}`}
                  title={`${ticker} illustrative candle ${index + 1}`}
                >
                  <span className={`absolute left-1/2 top-1/2 h-[140%] w-px -translate-x-1/2 -translate-y-1/2 ${up ? "bg-moss" : "bg-rust"}`} />
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-ink/40">
            <span>30 bars ago</span><span>Illustrative simulation · not live quotes</span><span>Now</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-xl shadow-ink/5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Dynamic vote allocation</span>
              <h3 className="mt-2 font-display text-xl font-bold">{selectedInfo.name}</h3>
            </div>
            {regime === "Liquidity Flush (Crash)" && (
              <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-cream">CRO 80% control</span>
            )}
          </div>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-ink/5">
            {weights.map((weight, index) => (
              <motion.div
                key={`${regime}-weight-${index}`}
                initial={{ width: 0 }}
                animate={{ width: `${weight}%` }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className={team[index].color}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {team.map((agent, index) => (
              <div key={agent.label} className="flex items-center gap-2 text-xs">
                <span className={`h-2.5 w-2.5 rounded-full ${agent.color}`} />
                <span className="text-ink/60">{agent.label}</span>
                <strong className="ml-auto tabular-nums">{weights[index]}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
