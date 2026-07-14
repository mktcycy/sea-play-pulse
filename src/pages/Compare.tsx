import { Link } from "react-router-dom";
import { X, Trophy, Zap, Sparkles as SparkIcon, Flame } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { getGame } from "@/data/games";
import { categoryLabel } from "@/data/categories";
import { tokenLabel } from "@/data/vocab";
import type { Game } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { LevelBar } from "@/components/Bits";
import { EmptyState } from "@/components/EmptyState";
import { DemoButton } from "@/components/GameActions";
import { pick } from "@/i18n";
import { heatScore } from "@/lib/format";

const VISUAL: Record<string, [string, string, string]> = {
  cute: ["可愛", "Dễ thương", "Cute"], luxe: ["奢華", "Sang trọng", "Luxe"], epic: ["史詩", "Hoành tráng", "Epic"], dynamic: ["動感", "Năng động", "Dynamic"], neon: ["霓虹", "Neon", "Neon"],
};

export default function Compare() {
  const { t, lang, market } = useMarket();
  const { compare, toggleCompare, clearCompare } = useSaved();
  const games = compare.map(getGame).filter(Boolean) as Game[];

  if (games.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">{t("compare.title")}</h1>
        <div className="mt-4">
          <EmptyState
            icon="GitCompareArrows"
            title={t("compare.empty")}
            hint={pick(lang, "在熱門榜或找遊戲頁點「加入比較」（最多 3 款）。", "Nhấn 'Thêm so sánh' ở bảng xếp hạng (tối đa 3).", "Tap 'Add to compare' on rankings (up to 3).")}
            action={<Link to="/pulse" className="btn-primary">{t("compare.pickMore")}</Link>}
          />
        </div>
      </div>
    );
  }

  const best = {
    newbie: winnerBy(games, (g) => 6 - g.difficulty),
    fastest: winnerBy(games, (g) => g.pace),
    rich: winnerBy(games, (g) => g.bonusRichness),
    hottest: winnerBy(games, (g) => heatScore(g, market)),
  };

  const rows: { key: string; label: string; text: (g: Game) => string; bar?: (g: Game) => number }[] = [
    { key: "provider", label: t("detail.provider"), text: (g) => g.provider },
    { key: "category", label: t("detail.category"), text: (g) => categoryLabel(g.category, lang) },
    { key: "mechanics", label: pick(lang, "玩法機制", "Cơ chế", "Mechanics"), text: (g) => g.mechanics.map((m) => tokenLabel(m, lang)).join("、") },
    { key: "pace", label: t("metric.pace"), text: (g) => `${g.pace}/5`, bar: (g) => g.pace },
    { key: "difficulty", label: t("metric.difficulty"), text: (g) => `${g.difficulty}/5`, bar: (g) => g.difficulty },
    { key: "visual", label: pick(lang, "畫面風格", "Phong cách", "Visual"), text: (g) => pick(lang, ...(VISUAL[g.visualStyle] ?? ["—", "—", "—"])) },
    { key: "onsite", label: pick(lang, "站內試玩", "Chơi tại trang", "On-site demo"), text: (g) => (g.demoType === "onsite" ? pick(lang, "支援", "Có", "Yes") : pick(lang, "官方 Demo", "Demo chính thức", "Official demo")) },
    { key: "suitable", label: pick(lang, "適合玩家", "Hợp với", "Suits"), text: (g) => g.suitableFor.map((s) => tokenLabel(s, lang)).join("、") },
  ];

  const conclusion = pick(
    lang,
    `新手先玩 ${best.newbie.name}；想要快節奏選 ${best.fastest.name}；玩法最豐富的是 ${best.rich.name}。`,
    `Người mới nên chơi ${best.newbie.name}; muốn nhịp nhanh chọn ${best.fastest.name}; phong phú nhất là ${best.rich.name}.`,
    `Beginners: try ${best.newbie.name}; want fast pace: ${best.fastest.name}; richest gameplay: ${best.rich.name}.`,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t("compare.title")}</h1>
        <button onClick={clearCompare} className="btn-ghost h-8 text-xs">{t("compare.clear")}</button>
      </div>

      {/* verdict chips */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Verdict icon={<Trophy size={14} />} label={t("compare.bestNewbie")} game={best.newbie} />
        <Verdict icon={<Zap size={14} />} label={t("compare.fastest")} game={best.fastest} />
        <Verdict icon={<SparkIcon size={14} />} label={t("compare.mostBonus")} game={best.rich} />
        <Verdict icon={<Flame size={14} />} label={t("compare.hottest")} game={best.hottest} />
      </div>

      {/* comparison — horizontal scroll (card-style columns) on mobile */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              <th className="w-24" />
              {games.map((g) => (
                <th key={g.id} className="p-2 align-top">
                  <div className="relative">
                    <button onClick={() => toggleCompare(g.id)} className="btn absolute -right-1 -top-1 z-10 h-6 w-6 bg-ink-800 p-0 text-content-muted" aria-label="remove"><X size={13} /></button>
                    <Link to={`/game/${g.id}`}><GameThumb game={g} className="w-full" ratio="aspect-[4/3]" /></Link>
                    <p className="mt-1.5 truncate text-center font-display text-xs font-semibold">{g.name}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = games.map(row.text);
              const allSame = values.every((v) => v === values[0]);
              return (
                <tr key={row.key} className={allSame ? "opacity-55" : ""}>
                  <td className="pr-2 text-xs text-content-muted">{row.label}</td>
                  {games.map((g, i) => (
                    <td key={g.id} className={`rounded-lg p-2 text-center align-middle ${allSame ? "bg-surface" : "bg-surface-raised"}`}>
                      <div className={`text-sm ${allSame ? "font-normal text-content-muted" : "font-semibold text-content"}`}>{values[i]}</div>
                      {row.bar && <div className="mx-auto mt-1.5 max-w-[80px]"><LevelBar value={row.bar(g)} /></div>}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td />
              {games.map((g) => (
                <td key={g.id} className="p-2"><DemoButton game={g} full label="free" /></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* conclusion */}
      <p className="mt-3 rounded-xl bg-surface-raised p-3 text-xs leading-relaxed text-content-muted">
        <span className="font-semibold text-content">{pick(lang, "比較結論", "Kết luận", "Conclusion")}：</span>{conclusion}
      </p>
    </div>
  );
}

function winnerBy(games: Game[], score: (g: Game) => number): Game {
  return [...games].sort((a, b) => score(b) - score(a))[0];
}

function Verdict({ icon, label, game }: { icon: React.ReactNode; label: string; game: Game }) {
  return (
    <div className="card p-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        <span className="text-pulse">{icon}</span> {label}
      </p>
      <Link to={`/game/${game.id}`} className="mt-1 block truncate text-sm font-semibold text-content hover:text-pulse">{game.name}</Link>
    </div>
  );
}
