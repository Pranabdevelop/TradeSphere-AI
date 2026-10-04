"use client";
import { motion } from "framer-motion";

const bars = [
  { h: 60, up: true, color: "bg-sage" },
  { h: 95, up: true, color: "bg-moss" },
  { h: 40, up: false, color: "bg-rust" },
  { h: 75, up: true, color: "bg-sage" },
  { h: 55, up: false, color: "bg-berry" },
  { h: 110, up: true, color: "bg-moss" },
  { h: 65, up: false, color: "bg-rust" },
];

/** A row of bobbing, scribbly candlestick bars — a sticker-style nod to the trading theme. */
export default function FloatingCandles({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`} aria-hidden>
      {bars.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: "bottom" }}
        >
          <motion.div
            animate={{ y: [0, b.up ? -8 : -3, 0] }}
            transition={{ duration: 2.4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            className={`w-3 sm:w-4 rounded-full ${b.color} border-2 border-ink`}
            style={{ height: b.h }}
          />
        </motion.div>
      ))}
    </div>
  );
}
