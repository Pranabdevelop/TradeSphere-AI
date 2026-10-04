"use client";
import { motion } from "framer-motion";
import { TrendingUp, Brain, Repeat, Shuffle, Bot, Users, Waves } from "lucide-react";

const agents = [
  { name: "Buy & Hold", icon: TrendingUp, sharpe: "0.71", color: "bg-butter" },
  { name: "Momentum", icon: Waves, sharpe: "0.42", color: "bg-sage" },
  { name: "Mean Reversion", icon: Repeat, sharpe: "0.38", color: "bg-berry/70" },
  { name: "ML Forecaster", icon: Brain, sharpe: "0.41", color: "bg-clay/80" },
  { name: "Regime Switcher", icon: Shuffle, sharpe: "0.58", color: "bg-moss" },
  { name: "RL Q-Learner", icon: Bot, sharpe: "0.36", color: "bg-rust/80" },
  { name: "Council (Ensemble)", icon: Users, sharpe: "0.53", color: "bg-ink text-cream" },
];

export default function Leaderboard() {
  return (
    <section id="agents" className="mx-auto mt-24 max-w-5xl px-6">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs font-bold">
          Agent Arena
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Who actually wins?</h2>
        <p className="mt-2 max-w-md text-ink/70">
          Seven agents, one out-of-sample test window, identical transaction costs. Sample numbers — your
          run will differ by ticker.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {agents.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
            className={`rounded-3xl border-2 border-ink p-5 shadow-chunkySm transition-shadow
                       hover:shadow-chunky ${a.color}`}
          >
            <a.icon size={22} strokeWidth={2.4} />
            <p className="mt-4 font-display text-lg font-bold leading-tight">{a.name}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-70">
              Sharpe · {a.sharpe}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
