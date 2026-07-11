import { ArrowDownRight, ArrowUpRight, Minus, Star } from "lucide-react";

// Small shared display atoms.

export function RankBadge({ rank, size = "md" }: { rank: number; size?: "sm" | "md" | "lg" }) {
  const top = rank <= 3;
  const cls =
    size === "lg" ? "h-9 w-9 text-base" : size === "sm" ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-xs";
  return (
    <div
      className={`tnum flex ${cls} items-center justify-center rounded-lg font-display font-bold ${
        top ? "bg-pulse/15 text-pulse ring-1 ring-pulse/40" : "bg-surface-raised text-content-muted"
      }`}
    >
      {rank}
    </div>
  );
}

export function TrendArrow({ value, className = "" }: { value: number; className?: string }) {
  if (value === 0)
    return (
      <span className={`inline-flex items-center gap-0.5 text-content-faint ${className}`}>
        <Minus size={13} /> <span className="tnum text-xs">0</span>
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold ${up ? "text-up" : "text-down"} ${className}`}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      <span className="tnum text-xs">{Math.abs(value)}</span>
    </span>
  );
}

export function HeatPill({ score, className = "" }: { score: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-flame/12 px-2 py-0.5 text-xs font-bold text-flame ${className}`}
      title="Heat score"
    >
      <span aria-hidden>🔥</span>
      <span className="tnum">{score}</span>
    </span>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-surface-line" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-flame" fill="currentColor" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// 1-5 segmented level bar for player-facing indicators.
export function LevelBar({ value, color = "#26E0C0" }: { value: number; color?: string }) {
  return (
    <div className="flex gap-1" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{ backgroundColor: i <= value ? color : "#26303F" }}
        />
      ))}
    </div>
  );
}
