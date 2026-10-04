"use client";
import { motion } from "framer-motion";
import FloatingCandles from "./FloatingCandles";

export default function Hero() {
  return (
    <section className="relative mx-auto mt-10 max-w-5xl overflow-visible px-6 pt-10 text-center">
      {/* blobby decoration */}
      <motion.div
        className="absolute -left-10 top-0 -z-10 h-40 w-40 rounded-blob bg-butter/70 animate-float"
        aria-hidden
      />
      <motion.div
        className="absolute -right-6 top-20 -z-10 h-28 w-28 rounded-blob bg-berry/40 animate-floatSlow"
        aria-hidden
      />

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block rounded-full border border-white/70 bg-white/65 px-4 py-2 text-[10px] font-bold
                   uppercase tracking-[0.14em] text-moss shadow-lg shadow-ink/5 backdrop-blur-md sm:text-xs"
      >
        ✨ Autonomous Multi-Agent Alpha Engine · Live Consensus
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-7xl"
      >
        Markets are messy.
        <br />
        <span className="outline-text">Your agents</span>{" "}
        <span className="text-clay">shouldn&apos;t be.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mx-auto mt-5 max-w-xl text-base text-ink/70 sm:text-lg"
      >
        Explore a simulated agent council weighing market regimes, risk limits, and walk-forward
        strategy concepts — then test the ideas in a paper portfolio. No broker connection or live orders.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <FloatingCandles />
      </motion.div>
    </section>
  );
}
