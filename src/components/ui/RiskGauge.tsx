"use client";

import { riskLabel } from "@/lib/utils";

const toneColors = {
  low: "#0e8c82",
  medium: "#dd9c07",
  high: "#e8544a",
};

/**
 * Semicircular "catch rate" gauge. The needle is styled as a fishing hook,
 * echoing the shield-and-hook mark used across the product — the one place
 * we spend the visual budget on a flourish.
 */
export function RiskGauge({ score, size = 180 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const { label, tone } = riskLabel(clamped);
  const color = toneColors[tone];

  const angle = -90 + (clamped / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;
  const r = size * 0.38;
  const needleLen = r * 0.82;
  const nx = cx + needleLen * Math.cos(rad);
  const ny = cy + needleLen * Math.sin(rad);

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = polarToCartesian(cx, cy, r, endAngle);
    const e = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
  };

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.68} viewBox={`0 0 ${size} ${size * 0.68}`}>
        <path d={arcPath(0, 60)} stroke="#0e8c82" strokeWidth={size * 0.06} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={arcPath(60, 120)} stroke="#dd9c07" strokeWidth={size * 0.06} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={arcPath(120, 180)} stroke="#e8544a" strokeWidth={size * 0.06} fill="none" strokeLinecap="round" opacity={0.85} />

        {/* Hook-shaped needle */}
        <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round">
          <line x1={cx} y1={cy} x2={nx} y2={ny} />
          <path
            d={`M ${nx} ${ny} q ${8 * Math.cos(rad + 1.4)} ${8 * Math.sin(rad + 1.4)}, ${
              nx + 10 * Math.cos(rad + 2.4)
            } ${ny + 10 * Math.sin(rad + 2.4)}`}
          />
        </g>
        <circle cx={cx} cy={cy} r={5} fill={color} />
      </svg>
      <div className="text-center -mt-2">
        <p className="font-display text-4xl font-semibold" style={{ color }}>
          {clamped}
        </p>
        <p className="text-xs font-medium text-slate uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  );
}
