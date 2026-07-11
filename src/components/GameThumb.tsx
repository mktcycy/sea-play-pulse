import type { Game } from "@/lib/types";
import { categoryColor } from "@/data/categories";
import { seededRandom } from "@/lib/format";
import { Icon } from "./Icon";
import { categoryIcon } from "@/data/categories";

// Procedural, consistent-ratio thumbnail so we never show a broken image.
export function GameThumb({
  game,
  className = "",
  ratio = "aspect-[4/3]",
  rounded = "rounded-xl",
}: {
  game: Game;
  className?: string;
  ratio?: string;
  rounded?: string;
}) {
  const color = categoryColor(game.category);
  const rnd = seededRandom(game.id);
  const orbs = Array.from({ length: 3 }, () => ({
    cx: 10 + rnd() * 80,
    cy: 10 + rnd() * 80,
    r: 12 + rnd() * 26,
    o: 0.12 + rnd() * 0.22,
  }));
  const rot = Math.floor(rnd() * 40) - 20;

  return (
    <div className={`relative overflow-hidden ${ratio} ${rounded} ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`g-${game.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0B0F17" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="#0F1420" />
        <rect width="100" height="100" fill={`url(#g-${game.id})`} opacity="0.5" />
        {orbs.map((o, i) => (
          <circle key={i} cx={o.cx} cy={o.cy} r={o.r} fill={color} opacity={o.o} />
        ))}
        <g transform={`rotate(${rot} 50 50)`} opacity="0.14">
          <path d="M0 70 Q25 55 50 70 T100 70" stroke={color} strokeWidth="6" fill="none" />
          <path d="M0 82 Q25 67 50 82 T100 82" stroke="#fff" strokeWidth="3" fill="none" />
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/25 backdrop-blur-sm"
          style={{ color }}
        >
          <Icon name={categoryIcon(game.category)} size={22} aria-hidden />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate font-display text-[13px] font-semibold text-white/95">{game.name}</p>
      </div>
    </div>
  );
}
