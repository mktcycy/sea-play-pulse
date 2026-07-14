import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swords, Shuffle } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { DUELS } from "@/data/duel";
import { getGame } from "@/data/games";
import { tokenLabel } from "@/data/vocab";
import type { Game, Lang } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { LevelBar } from "@/components/Bits";
import { DemoButton } from "@/components/GameActions";
import { pick } from "@/i18n";

const VISUAL: Record<string, [string, string, string]> = {
  cute: ["可愛", "Dễ thương", "Cute"], luxe: ["奢華", "Sang trọng", "Luxe"], epic: ["史詩", "Hoành tráng", "Epic"], dynamic: ["動感", "Năng động", "Dynamic"], neon: ["霓虹", "Neon", "Neon"],
};
const vis = (g: Game, lang: Lang) => pick(lang, ...(VISUAL[g.visualStyle] ?? ["—", "—", "—"]));

export default function Duel() {
  const { t, lang, market } = useMarket();
  const { vote, hasVoted } = useSaved();
  const { push } = useToast();
  const [idx, setIdx] = useState(0);
  const duel = DUELS[idx % DUELS.length];
  const a = getGame(duel.gameA);
  const b = getGame(duel.gameB);

  const voted = hasVoted(duel.id);
  const shuffle = () => setIdx((i) => (i + 1) % DUELS.length);

  const conclusion = useMemo(() => {
    if (!a || !b) return "";
    const simpler = a.difficulty <= b.difficulty ? a : b;
    const richer = a.bonusRichness >= b.bonusRichness ? a : b;
    return pick(
      lang,
      `${simpler.name} 適合喜歡簡單操作的玩家；${richer.name} 適合喜歡豐富玩法的玩家。`,
      `${simpler.name} hợp người thích thao tác đơn giản; ${richer.name} hợp người thích lối chơi phong phú.`,
      `${simpler.name} suits players who like simple controls; ${richer.name} suits those who like richer gameplay.`,
    );
  }, [a, b, lang]);

  if (!a || !b) return null;

  const total = duel.votesA + duel.votesB + (voted ? 1 : 0);
  const va = duel.votesA + (voted === "A" ? 1 : 0);
  const pctA = Math.round((va / total) * 100);
  const localSplitA = market === "vn" ? duel.vnSplitA : duel.phSplitA;

  const rows: { label: string; render: (g: Game) => React.ReactNode }[] = [
    { label: pick(lang, "遊戲節奏", "Nhịp độ", "Pace"), render: (g) => <LevelBar value={g.pace} /> },
    { label: pick(lang, "操作難度", "Độ khó", "Difficulty"), render: (g) => <LevelBar value={g.difficulty} color="#FB7185" /> },
    { label: pick(lang, "玩法豐富度", "Độ phong phú", "Gameplay depth"), render: (g) => <LevelBar value={g.bonusRichness} /> },
    { label: pick(lang, "畫面風格", "Phong cách", "Visual style"), render: (g) => <span className="chip">{vis(g, lang)}</span> },
    { label: pick(lang, "特殊機制", "Cơ chế đặc biệt", "Mechanics"), render: (g) => <span className="text-xs text-content-muted">{g.mechanics.map((m) => tokenLabel(m, lang)).join("、")}</span> },
  ];

  const cast = (choice: "A" | "B") => { if (voted) return; vote(duel.id, choice); push(t("toast.voted"), "success"); };

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Swords size={20} className="text-pulse" />
          <h1 className="font-display text-2xl font-bold">{t("duel.title")}</h1>
        </div>
        <button onClick={shuffle} className="btn-ghost h-8 text-xs"><Shuffle size={14} /> {t("action.rematch")}</button>
      </div>
      <p className="mt-1 text-sm text-content-muted">{t("duel.subtitle")}</p>

      {/* two games side by side */}
      <div className="card mt-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          {([a, b] as const).map((g, i) => {
            const choice = i === 0 ? "A" : "B";
            const isMine = voted === choice;
            return (
              <div key={g.id} className="flex flex-col">
                <Link to={`/game/${g.id}`}><GameThumb game={g} ratio="aspect-[4/3]" /></Link>
                <p className="mt-1.5 truncate text-center font-display text-sm font-semibold">{g.name}</p>
                <p className="truncate text-center text-[11px] text-content-muted">{g.provider}</p>
                <div className="mt-1.5"><DemoButton game={g} full label="free" /></div>
                <button onClick={() => cast(choice)} disabled={!!voted} className={`btn mt-1.5 h-8 text-xs ${isMine ? "bg-pulse text-ink" : voted ? "border border-surface-line text-content-muted" : "btn-ghost"}`}>
                  {voted ? `${i === 0 ? pctA : 100 - pctA}%` : t("duel.pick")}
                </button>
              </div>
            );
          })}
        </div>

        {/* comparison rows */}
        <div className="mt-4 grid gap-2.5 border-t border-surface-line pt-3">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="min-w-0">{row.render(a)}</div>
              <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-content-faint">{row.label}</div>
              <div className="flex min-w-0 justify-end text-right">{row.render(b)}</div>
            </div>
          ))}
        </div>

        {voted && (
          <div className="mt-3 border-t border-surface-line pt-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-surface-line">
              <div className="bg-pulse" style={{ width: `${pctA}%` }} />
              <div className="bg-vn" style={{ width: `${100 - pctA}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-content-muted">
              <span>{t("duel.voted", { n: total.toLocaleString() })}</span>
              <span>{market === "vn" ? t("duel.vnPref") : t("duel.phPref")}：{a.name} {localSplitA}%</span>
            </div>
          </div>
        )}

        {/* conclusion */}
        <p className="mt-3 rounded-xl bg-surface-raised p-3 text-xs leading-relaxed text-content-muted">
          <span className="font-semibold text-content">{pick(lang, "小結", "Tóm lại", "Takeaway")}：</span>{conclusion}
        </p>
      </div>
    </div>
  );
}
