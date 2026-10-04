"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar, { type DashboardTab } from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import StatBlob from "@/components/StatBlob";
import LiveAgentArena from "@/components/LiveAgentArena";
import RegimeSwitcher, { type Regime } from "@/components/RegimeSwitcher";
import RiskLab from "@/components/RiskLab";
import PortfolioSimulator from "@/components/PortfolioSimulator";

const tabContent: Record<DashboardTab, { eyebrow: string; title: string; description: string }> = {
  agents: {
    eyebrow: "Consensus intelligence",
    title: "Four perspectives. One disciplined signal.",
    description: "See how the simulated agent council debates conditions and aggregates its weighted view.",
  },
  regimes: {
    eyebrow: "Adaptive market context",
    title: "Change the phase. Rebalance the council.",
    description: "Select a market scenario to preview how agent priorities and illustrative price action adapt.",
  },
  "risk-lab": {
    eyebrow: "Risk controls",
    title: "Set guardrails before seeking returns.",
    description: "Explore how risk tolerance and leverage affect simplified portfolio risk estimates.",
  },
  portfolio: {
    eyebrow: "Paper portfolio",
    title: "Test a strategy without placing a trade.",
    description: "Run a repeatable 30-session simulation and inspect the illustrative equity curve and fills.",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("agents");
  const [regime, setRegime] = useState<Regime>("Bull Euphoria");

  const selectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    window.setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };
  const activeContent = tabContent[activeTab];

  return (
    <main className="min-h-screen pb-24">
      <Navbar activeTab={activeTab} onSelectTab={selectTab} />
      <Hero />
      <Marquee />

      <section className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 px-6 sm:grid-cols-4" aria-label="Platform overview">
        <StatBlob label="Simulated Agents" value={4} color="bg-butter" />
        <StatBlob label="Market Regimes" value={4} color="bg-sage" />
        <StatBlob label="Risk Controls" value={3} color="bg-berry/60" />
        <StatBlob label="Starting Paper Capital ($)" value={100} suffix="k" color="bg-clay/80" />
      </section>

      <section id="dashboard" className="mx-auto mt-20 max-w-6xl scroll-mt-28 px-6">
        <div className="mb-8 text-center">
          <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-moss shadow-sm">
            {activeContent.eyebrow}
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold sm:text-5xl">{activeContent.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink/60 sm:text-base">{activeContent.description}</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "agents" && <LiveAgentArena regime={regime} />}
            {activeTab === "regimes" && <RegimeSwitcher regime={regime} onChange={setRegime} />}
            {activeTab === "risk-lab" && <RiskLab />}
            {activeTab === "portfolio" && <PortfolioSimulator />}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="mx-auto mt-24 max-w-5xl px-6 text-center text-xs leading-relaxed text-ink/45">
        TradeSphere AI is an interactive simulation for research and education. It does not provide investment advice or execute live trades.
      </footer>
    </main>
  );
}
