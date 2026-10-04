"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export type DashboardTab = "agents" | "regimes" | "risk-lab" | "portfolio";

const links: { label: string; tab: DashboardTab }[] = [
  { label: "Agents", tab: "agents" },
  { label: "Regimes", tab: "regimes" },
  { label: "Risk Lab", tab: "risk-lab" },
  { label: "Portfolio", tab: "portfolio" },
];

type NavbarProps = {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
};

export default function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  const launchDashboard = () => {
    onSelectTab("portfolio");
    window.setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-4 z-50 mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 rounded-[2rem]
                 border-2 border-ink bg-cream/90 px-5 py-3 shadow-chunkySm backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay border-2 border-ink">
          <Sparkles size={16} className="text-cream" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">TradeSphere AI</span>
      </div>
      <div className="hidden gap-1 text-sm font-medium sm:flex">
        {links.map(({ label, tab }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            aria-current={activeTab === tab ? "page" : undefined}
            className={`rounded-full px-3 py-2 transition-colors hover:text-rust ${
              activeTab === tab ? "bg-white/75 text-rust shadow-sm" : "text-ink/75"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex w-full gap-1 overflow-x-auto sm:hidden">
        {links.map(({ label, tab }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            aria-current={activeTab === tab ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === tab ? "bg-white/75 text-rust shadow-sm" : "text-ink/75"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={launchDashboard}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream
                   shadow-chunkySm transition hover:-translate-y-0.5 hover:shadow-chunky"
      >
        Launch Dashboard
      </button>
    </motion.nav>
  );
}
