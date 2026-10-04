"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function StatBlob({
  label,
  value,
  suffix = "",
  color = "bg-sage",
}: {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const steps = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round((value * i) / steps));
      if (i >= steps) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ rotate: -2, scale: 1.04 }}
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-ink ${color}
                 px-6 py-8 text-center shadow-chunkySm`}
    >
      <span className="font-display text-4xl font-bold text-ink">
        {display}
        {suffix}
      </span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/70">{label}</span>
    </motion.div>
  );
}
