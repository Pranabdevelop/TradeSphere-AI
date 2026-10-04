const items = [
  "WALK-FORWARD VALIDATION",
  "NO LOOK-AHEAD BIAS",
  "Q-LEARNING AGENT",
  "REGIME DETECTION",
  "MONTE-CARLO RISK",
  "STRESS TESTED",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="mt-20 overflow-hidden border-y-2 border-ink bg-ink py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {doubled.map((t, i) => (
          <span key={i} className="font-display text-sm font-bold tracking-widest text-cream">
            {t} <span className="text-butter">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
